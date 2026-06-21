const fs = require('fs');
const path = require('path');

const replacements = [
  { file: 'src/layouts/MainLayout.tsx', replace: ['../modules/auth/hooks/useAuth', '../modules/paquete1_seguridad/auth/hooks/useAuth'] },
  { file: 'src/modules/dashboard/pages/ClienteComprarPage.tsx', replace: ['../../catalogo/catalogoService', '../../paquete3_configuracion/catalogo/catalogoService'] },
  { file: 'src/modules/dashboard/pages/ClienteComprarPage.tsx', replace: ['../../ventas/services/ventaService', '../../paquete5_ventas/ventas/services/ventaService'] },
  { file: 'src/modules/dashboard/pages/ClienteComprarPage.tsx', replace: ['../../catalogo/types/catalogo.types', '../../paquete3_configuracion/catalogo/types/catalogo.types'] },
  { file: 'src/modules/dashboard/pages/ClienteComprarPage.tsx', replace: ['../../ventas/components/TicketModal', '../../paquete5_ventas/ventas/components/TicketModal'] }
];

for (const {file, replace} of replacements) {
    const fullPath = path.join('c:/Users/chave/saborxpress-front', file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.split(replace[0]).join(replace[1]);
        fs.writeFileSync(fullPath, content);
        console.log('Fixed ' + file);
    } else {
        console.log('Not found ' + file);
    }
}
