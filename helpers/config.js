const formatear_fecha = async(fecha_vto)=>{
   const fecha = new Date(fecha_vto);
   const opciones = { year: 'numeric', month: 'numeric', day: 'numeric' };

   const search = '/'  
   const replacer = new RegExp(search, 'g')

   const fecha_format = fecha.toLocaleDateString('en-us', opciones);
   const fecha_formateada = fecha_format.replace(replacer, '-')
   return fecha_formateada;
}

module.exports = {
   formatear_fecha,
}