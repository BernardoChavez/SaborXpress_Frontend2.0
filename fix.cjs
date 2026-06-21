const fs = require('fs');
const path = require('path');

const replacements = [
  { file: 'src/modules/dashboard/pages/ClienteNotificacionesPage.tsx', replace: ['../../ventas/', '../../paquete5_ventas/ventas/'] },
  { file: 'src/modules/dashboard/pages/ClienteTicketsPage.tsx', replace: ['../../ventas/', '../../paquete5_ventas/ventas/'] },
  { file: 'src/modules/dashboard/pages/DashboardPage.tsx', replace: ['../../bitacora/', '../../paquete9_auditoria/bitacora/'] },
  { file: 'src/modules/paquete1_seguridad/auth/hooks/useAuth.ts', replace: ['../../../core/store/useAuthStore', '../../../../core/store/useAuthStore'] },
  { file: 'src/modules/paquete1_seguridad/auth/hooks/useAuth.ts', replace: ['../../../api/services/authService', '../../../../api/services/authService'] },
  { file: 'src/modules/paquete1_seguridad/auth/pages/LoginPage.tsx', replace: ['../../../utils/parseApiError', '../../../../utils/parseApiError'] },
  { file: 'src/modules/paquete1_seguridad/auth/pages/RecoverPasswordPage.tsx', replace: ['../../../api/services/authService', '../../../../api/services/authService'] },
  { file: 'src/modules/paquete1_seguridad/auth/pages/RegisterPage.tsx', replace: ['../../../utils/parseApiError', '../../../../utils/parseApiError'] },
  { file: 'src/modules/paquete1_seguridad/auth/pages/UnauthorizedPage.tsx', replace: ['../../../core/store/useAuthStore', '../../../../core/store/useAuthStore'] },
  { file: 'src/modules/paquete1_seguridad/roles/rolesService.ts', replace: ['../../api/axios', '../../../api/axios'] },
  { file: 'src/modules/paquete2_personal/usuarios/components/UsuarioModal.tsx', replace: ['../../../utils/parseApiError', '../../../../utils/parseApiError'] },
  { file: 'src/modules/paquete2_personal/usuarios/usuarioService.ts', replace: ['../../api/axios', '../../../api/axios'] },
  { file: 'src/modules/paquete3_configuracion/catalogo/catalogoService.ts', replace: ['../../api/axios', '../../../api/axios'] },
  { file: 'src/modules/paquete3_configuracion/catalogo/components/CategoriaModal.tsx', replace: ['../../../utils/parseApiError', '../../../../utils/parseApiError'] },
  { file: 'src/modules/paquete3_configuracion/catalogo/components/ProductoModal.tsx', replace: ['../../../utils/parseApiError', '../../../../utils/parseApiError'] },
  { file: 'src/modules/paquete3_configuracion/empresa/empresaService.ts', replace: ['../../api/axios', '../../../api/axios'] },
  { file: 'src/modules/paquete4_inventarios/inventario/components/RecetasModal.tsx', replace: ['../../catalogo/catalogoService', '../../../paquete3_configuracion/catalogo/catalogoService'] },
  { file: 'src/modules/paquete4_inventarios/inventario/components/RecetasModal.tsx', replace: ['../../catalogo/types/catalogo.types', '../../../paquete3_configuracion/catalogo/types/catalogo.types'] },
  { file: 'src/modules/paquete4_inventarios/inventario/inventarioService.ts', replace: ['../../api/axios', '../../../api/axios'] },
  { file: 'src/modules/paquete5_ventas/ventas/pages/POSPage.tsx', replace: ['../../catalogo/catalogoService', '../../../paquete3_configuracion/catalogo/catalogoService'] },
  { file: 'src/modules/paquete5_ventas/ventas/pages/POSPage.tsx', replace: ['../../catalogo/types/catalogo.types', '../../../paquete3_configuracion/catalogo/types/catalogo.types'] },
  { file: 'src/modules/paquete5_ventas/ventas/services/cajaService.ts', replace: ['../../../api/axios', '../../../../api/axios'] },
  { file: 'src/modules/paquete5_ventas/ventas/services/ventaService.ts', replace: ['../../../api/axios', '../../../../api/axios'] },
  { file: 'src/modules/paquete6_produccion/cocina/cocinaService.ts', replace: ['../../api/axios', '../../../api/axios'] },
  { file: 'src/modules/paquete6_produccion/cocina/types/cocina.types.ts', replace: ['../../catalogo/types/catalogo.types', '../../../paquete3_configuracion/catalogo/types/catalogo.types'] },
  { file: 'src/modules/paquete7_comprobantes/comprobantes/pages/AnulacionesPage.tsx', replace: ['../../ventas/', '../../../paquete5_ventas/ventas/'] },
  { file: 'src/modules/paquete7_comprobantes/comprobantes/pages/TicketsPage.tsx', replace: ['../../ventas/', '../../../paquete5_ventas/ventas/'] },
  { file: 'src/modules/paquete9_auditoria/bitacora/bitacoraService.ts', replace: ['../../api/axios', '../../../api/axios'] }
];

for (const {file, replace} of replacements) {
    const fullPath = path.join('c:/Users/chave/saborxpress-front', file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        // Usar split y join para reemplazar todas las ocurrencias
        content = content.split(replace[0]).join(replace[1]);
        fs.writeFileSync(fullPath, content);
        console.log('Fixed ' + file);
    } else {
        console.log('Not found ' + file);
    }
}
