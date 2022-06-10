
const base64 = require('base64topdf');
const {formatear_fecha} = require('./helpers/config');

const generar_pdf = async(dni, fecha_vto, archivo) =>{
   console.log('Generando pdf ...');
   const fecha_formateada = await formatear_fecha(fecha_vto) 
   await base64.base64Decode(archivo, './pdf/'+ dni + '/'+ dni + '-' + fecha_formateada +'.pdf');
   return true
}

module.exports = {
   generar_pdf,
}