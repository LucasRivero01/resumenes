const fs = require('fs');
const {executeQuery} = require('./baseOracleRepository');
const {generar_pdf} = require('./conversor_base64');
const {formatear_fecha} = require('./helpers/config');

const archivoSalida = './db/datos.json'
const archiver = require('archiver');
const leerDB = async() => {
   if (!fs.existsSync(archivoSalida)){
      return null;
   }
   const datos = fs.readFileSync(archivoSalida, {encoding: 'utf-8'});
   const resultado = JSON.parse(datos);
   console.log('Leyendo entrada ...');
   for (x of resultado) {
      const result = await executeQuery(x.titular, x.fecha_desde, x.fecha_hasta);
      if (isObjEmpty(result)) {
         console.log('Titular ' + x.titular + ' sin resumen para el periodo ingresado');
      }else{
         if (!fs.existsSync('./pdf/'+ x.titular)){
            fs.mkdirSync('./pdf/'+ x.titular, (error) => {
               if (error){
                  console.log('Error al crear el directorio');
               }
            });
         }
         // si tengo datos creo el archivo comprimido para meterle datos
         var output = fs.createWriteStream('./pdf/' + x.titular + '-' + x.fecha_desde + '-' + x.fecha_hasta + '.zip');
         var archive = archiver('zip');
         archive.pipe(output);
         for(var i= 0; i < result.rows.length; i++) {
            var string = result.rows[i].toString().split(',');
            await generar_pdf(string[0], string[2], string[1])
            const fecha_formateada = await formatear_fecha(string[2]);
            await archive.append(
               fs.createReadStream
               ('./pdf/'+ x.titular + '/' +  + x.titular + '-' + fecha_formateada + '.pdf'),
                  {name:  x.titular + '-' + fecha_formateada + '.pdf'}
            );          
         }
         await archive.finalize();
         await eliminar_archivos('./pdf/'+ x.titular);
      }
   }
   return true
}

function isObjEmpty(obj) {
   for (var prop in obj) {
     if (obj.hasOwnProperty(prop)) return false;
   }
 
   return true;
}

const eliminar_archivos = async(directorio) => {
   console.log('Eliminando directorio ' + directorio);
   await fs.readdirSync(directorio).forEach((fileName) => {
      fs.unlinkSync(`${directorio}` + '/' + `${fileName}`);
   });

   await fs.rmdir(directorio, (error) => {
      if (error){
         console.log('error al eliminar el directorio: ', error);
         return false
      }
   })
   return true;
}
module.exports = {
   leerDB,
}