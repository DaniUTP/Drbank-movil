# RTK Query con TagTypes - React Native

Configuración de Redux Toolkit Query para consumo de APIs en React Native con cache invalidación usando TagTypes.

## Estructura

```
store/
├── constants/
│   └── tagTypes.constants.ts    # Enum de TagTypes para cache invalidation
├── helpers/
│   └── getBaseQueryRN.ts        # BaseQuery adaptado para React Native con AsyncStorage
├── api.ts                       # API central con TagTypes definidos
└── index.ts                     # Store central con configureStore

services/
└── user.rtkq.ts                 # Ejemplo de servicio RTK Query
```

## Configuración

### 1. BaseQuery (getBaseQueryRN.ts)

El BaseQuery está configurado para:
- Usar `AsyncStorage` para obtener tokens de autenticación
- Agregar headers de Authorization automáticamente
- Usar URL base absoluta para la API

**Importante**: Reemplaza `API_BASE_URL` con tu URL real de la API.

```typescript
const API_BASE_URL = 'https://tu-api.com/api';
```

### 2. TagTypes (tagTypes.constants.ts)

Define los tags para cache invalidación:

```typescript
export const enum TagTypes {
  User = 'User',
  Products = 'Products',
  Orders = 'Orders',
  Transactions = 'Transactions',
  Accounts = 'Accounts',
}
```

### 3. API Central (api.ts)

La API central incluye todos los TagTypes definidos. Los servicios se inyectan usando `api.injectEndpoints()`.

## Uso de Servicios

### Crear un nuevo servicio

1. Crea un archivo en `services/` (ej: `products.rtkq.ts`)
2. Inyecta endpoints usando `api.injectEndpoints()`

```typescript
import { api } from '../store/api';
import { TagTypes } from '../store/constants/tagTypes.constants';

export const productSlice = api.injectEndpoints({
  endpoints: builder => ({
    getProducts: builder.query<Product[], void>({
      providesTags: [TagTypes.Products],
      query: () => ({
        method: 'GET',
        url: '/products',
      }),
    }),
    createProduct: builder.mutation<Product, Partial<Product>>({
      invalidatesTags: [TagTypes.Products],
      query: body => ({
        method: 'POST',
        url: '/products',
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useGetProductsQuery, useCreateProductMutation } = productSlice;
```

### Usar en componentes

```typescript
import { useGetUsersQuery, useCreateUserMutation } from '../services/user.rtkq';

function UserList() {
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  if (isLoading) return <Text>Cargando...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {users?.map(user => (
        <Text key={user.id}>{user.name}</Text>
      ))}
    </View>
  );
}
```

## Cache Invalidation con TagTypes

### providesTags (Queries)

Asocia un query con un tag para que pueda ser invalidado:

```typescript
builder.query<User[], void>({
  providesTags: [TagTypes.User], // Invalida todos los usuarios
  // O invalidación específica:
  // providesTags: (result, error, id) => [{ type: TagTypes.User, id }],
  query: () => '/users',
})
```

### invalidatesTags (Mutations)

Invalida el cache cuando se ejecuta una mutation:

```typescript
builder.mutation<User, Partial<User>>({
  invalidatesTags: [TagTypes.User], // Invalida todos los usuarios
  // O invalidación específica:
  // invalidatesTags: (result, error, arg) => [{ type: TagTypes.User, id: arg.id }],
  query: body => ({
    method: 'POST',
    url: '/users',
    body,
  }),
})
```

## Diferencias Web vs React Native

| Aspecto | Web | React Native |
|---------|-----|--------------|
| BaseQuery | fetchBaseQuery con location.origin | fetchBaseQuery con URL absoluta |
| Storage | localStorage/sessionStorage | AsyncStorage |
| Auth | Tokens via @mfe/auth o postMessage | Tokens via AsyncStorage |
| Middleware | Error middleware personalizado | Mismo middleware compatible |
| TagTypes | Enum en archivo separado | Igual (no cambia) |
| injectEndpoints | api.injectEndpoints | Igual (no cambia) |

## Autenticación

El BaseQuery automáticamente agrega el token desde AsyncStorage:

```typescript
const token = await AsyncStorage.getItem('access_token');
if (token) {
  headers.set('Authorization', `Bearer ${token}`);
}
```

Para guardar el token después del login:

```typescript
await AsyncStorage.setItem('access_token', token);
```

## Hooks Disponibles

RTK Query genera automáticamente hooks para cada endpoint:

- **Queries**: `use{EndpointName}Query`, `useLazy{EndpointName}Query`
- **Mutations**: `use{EndpointName}Mutation`

Ejemplo:
```typescript
const { data, isLoading, error } = useGetUsersQuery();
const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
```

## Tipos TypeScript

Los servicios están tipados. Define tus interfaces según tu API:

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}
```

## Notas

- Los errores de TypeScript iniciales se resolverán cuando el servidor TypeScript se actualice
- Asegúrate de configurar `API_BASE_URL` en `getBaseQueryRN.ts`
- Usa TagTypes consistentemente para cache invalidación efectiva
- El Provider Redux ya está configurado en `app/_layout.tsx`
