import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useHistoryStore = create(
  persist(
    (set, get) => ({
      // Filtros guardados
      savedFilters: [],
      
      // Consultas favoritas/marcadas
      favorites: [],
      
      // Acciones
      saveFilter: (name, filters) => {
        set(state => ({
          savedFilters: [...state.savedFilters, { id: Date.now(), name, filters }]
        }))
      },
      
      deleteFilter: (id) => {
        set(state => ({
          savedFilters: state.savedFilters.filter(f => f.id !== id)
        }))
      },
      
      toggleFavorite: (consultaId) => {
        set(state => {
          const exists = state.favorites.includes(consultaId)
          return {
            favorites: exists
              ? state.favorites.filter(id => id !== consultaId)
              : [...state.favorites, consultaId]
          }
        })
      },
      
      isFavorite: (consultaId) => {
        return get().favorites.includes(consultaId)
      }
    }),
    {
      name: 'history-storage'
    }
  )
)