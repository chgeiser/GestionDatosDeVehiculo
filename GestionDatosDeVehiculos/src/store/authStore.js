import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      cliente: null,
      
      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password })
          const { token, user, cliente } = response.data.data
          
          set({ 
            token, 
            user, 
            cliente,
            isAuthenticated: true 
          })
          
          // Configurar token en axios
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.mensaje || 'Error al iniciar sesión' 
          }
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          cliente: null
        })
        delete api.defaults.headers.common['Authorization']
      },
      
      updateCreditos: (nuevosCreditos) => {
        set(state => ({
          cliente: { ...state.cliente, creditosRestantes: nuevosCreditos }
        }))
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        cliente: state.cliente 
      })
    }
  )
)