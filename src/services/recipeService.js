import { apiClient, BASE_URL } from '../config/api';

const CACHE_NAME = 'recipes-cache-v1';

class RecipeService {
    /**
    * Get all recipes with optional filters
    * @param {Object} params - Query parameters
    * @param {number} params.page - Page number (default: 1)
    * @param {number} params.limit - Items per page (default: 10)
    * @param {string} params.category - Filter by category: 'makanan' | 'minuman'
    * @param {string} params.difficulty - Filter by difficulty: 'mudah' | 'sedang' | 'sulit'
    * @param {string} params.search - Search in name/description
    * @param {string} params.sort_by - Sort by field (default: 'created_at')
    * @param {string} params.order - Sort order: 'asc' | 'desc' (default: 'desc')
    * @returns {Promise}
    */
    async getRecipes(params = {}) {
        return apiClient.get('/api/v1/recipes', { params });
    }
    /**
    * Get recipe by ID
    * @param {string} id - Recipe ID
    * @returns {Promise}
    */
    /**
     * Get recipe by ID with caching support.
     * Tries Cache Storage first, then network. Also writes to Cache Storage & localStorage as fallback.
     * @param {string} id
     * @param {Object} opts - { useCache: boolean, force: boolean }
     */
    async getRecipeById(id, opts = { useCache: true, force: false }) {
        const { useCache = true, force = false } = opts;
        const apiPath = `/api/v1/recipes/${id}`;
        const fullUrl = `${BASE_URL}${apiPath}`;

        // Try Cache Storage (disk cache)
        if (useCache && 'caches' in window && !force) {
            try {
                const cache = await caches.open(CACHE_NAME);
                const cachedResponse = await cache.match(fullUrl);
                if (cachedResponse) {
                    const data = await cachedResponse.json();
                    return { success: true, data, cached: true };
                }
            } catch {
                console.warn('CacheStorage read error');
            }
        }

        // Fallback to localStorage cache (fast path)
        if (useCache && !force) {
            try {
                const lsKey = `recipe_cache_${id}`;
                const ls = localStorage.getItem(lsKey);
                if (ls) {
                    try {
                        const parsed = JSON.parse(ls);
                        return { success: true, data: parsed, cached: true, storage: 'localStorage' };
                    } catch {
                        // corrupted localStorage entry, remove it
                        localStorage.removeItem(lsKey);
                    }
                }
            } catch {
                console.warn('localStorage read error');
            }
        }

        // Network fetch via apiClient
        try {
            const response = await apiClient.get(apiPath);
            // apiClient's response is already data (see interceptor), but we want to
            // store full JSON structure in cache.
            if (response && response.data) {
                const payload = response.data;
                // Write to Cache Storage
                if ('caches' in window) {
                    try {
                        const cache = await caches.open(CACHE_NAME);
                        const resp = new Response(JSON.stringify(payload), {
                            headers: { 'Content-Type': 'application/json' },
                        });
                        // Use fullUrl as request key
                        await cache.put(fullUrl, resp.clone());
                    } catch {
                        console.warn('CacheStorage write error');
                    }
                }
                // Write to localStorage as fallback
                try {
                    localStorage.setItem(`recipe_cache_${id}`, JSON.stringify(payload));
                } catch {
                    // ignore quota errors
                }
                return { success: true, data: payload, cached: false };
            }
            // if response not shaped as expected, return as-is
            return { success: true, data: response };
        } catch (error) {
            // If network fails and we didn't return earlier, try to return any localStorage cache
            try {
                const lsKey = `recipe_cache_${id}`;
                const ls = localStorage.getItem(lsKey);
                if (ls) {
                    const parsed = JSON.parse(ls);
                    return { success: true, data: parsed, cached: true, storage: 'localStorage-offline' };
                }
            } catch {
                // ignore
            }
            // propagate error
            throw error;
        }
    }

    // Cache inspection helpers
    async listCachedRecipes() {
        const result = { cacheStorage: [], localStorage: [] };
        if ('caches' in window) {
            try {
                const cache = await caches.open(CACHE_NAME);
                const requests = await cache.keys();
                result.cacheStorage = requests.map((r) => r.url);
            } catch {
                console.warn('listCachedRecipes cache error');
            }
        }
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('recipe_cache_')) {
                    result.localStorage.push(key);
                }
            }
        } catch {
            console.warn('listCachedRecipes localStorage error');
        }
        return result;
    }

    async clearCachedRecipe(id) {
        const apiPath = `/api/v1/recipes/${id}`;
        const fullUrl = `${BASE_URL}${apiPath}`;
        if ('caches' in window) {
            try {
                const cache = await caches.open(CACHE_NAME);
                await cache.delete(fullUrl);
            } catch {
                console.warn('clearCachedRecipe cache error');
            }
        }
        try {
            localStorage.removeItem(`recipe_cache_${id}`);
        } catch {
            // ignore
        }
        return true;
    }

    async clearAllRecipeCache() {
        if ('caches' in window) {
            try {
                await caches.delete(CACHE_NAME);
            } catch {
                console.warn('clearAllRecipeCache cache error');
            }
        }
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('recipe_cache_')) keys.push(key);
            }
            keys.forEach((k) => localStorage.removeItem(k));
        } catch {
            // ignore
        }
        return true;
    }

    // Quick network check: navigator.onLine + optional ping to API base URL
    async checkNetworkStatus({ ping = true, timeout = 3000 } = {}) {
        const online = navigator.onLine;
        if (!ping) return { online };
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            const res = await fetch(BASE_URL || '/', { method: 'HEAD', signal: controller.signal });
            clearTimeout(id);
            return { online: true, status: res.status };
        } catch (err) {
            return { online: false, error: err.message };
        }
    }
    /**
    * Create new recipe
    * @param {Object} recipeData - Recipe data
    * @returns {Promise}
    */
    async createRecipe(recipeData) {
        return apiClient.post('/api/v1/recipes', recipeData);
    }
    /**
    * Update existing recipe (full replacement)
    * @param {string} id - Recipe ID
    * @param {Object} recipeData - Complete recipe data (all fields required)
    * @returns {Promise}
    */
    async updateRecipe(id, recipeData) {
        return apiClient.put(`/api/v1/recipes/${id}`, recipeData);
    }
    /**
    * Partially update recipe (only send fields to update)
    * @param {string} id - Recipe ID
    * @param {Object} partialData - Partial recipe data (only fields to update)
    * @returns {Promise}
    */
    async patchRecipe(id, partialData) {
        return apiClient.patch(`/api/v1/recipes/${id}`, partialData);
    }
    /**
    * Delete recipe
    * @param {string} id - Recipe ID
    * @returns {Promise}
    */
    async deleteRecipe(id) {
        return apiClient.delete(`/api/v1/recipes/${id}`);
    }
}
export default new RecipeService();