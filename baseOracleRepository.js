const dbconfig = require ('./dbconfig');
/* eslint-disable max-len */
// eslint-disable-next-line no-unused-vars
const oracledb = require('oracledb');
oracledb.fetchAsBuffer = [ oracledb.BLOB ];

async function executeQuery(accountId, dateFrom, dateThru, historical) {
   let queryWithReplecaedVariables = '';
   // valido si viene fecha hasta, dependiendo de esto
   // se ejecuta una u otra query
   if (dateThru === undefined){
      queryWithReplecaedVariables =
      GET_BY_ACCOUNT_ID_AND_DATE_QUERY
      .replace(/\$accountId\$/g, accountId)
      .replace(/\$dateFrom\$/g, dateFrom)
   }else{
      queryWithReplecaedVariables =
      GET_BY_ACCOUNT_ID_AND_BETWEEN_DATE_QUERY
      .replace(/\$accountId\$/g, accountId)
      .replace(/\$dateFrom\$/g, dateFrom)
      .replace(/\$dateThru\$/g, dateThru);    
   }

   const oracleDbResult = execute(queryWithReplecaedVariables, accountId);
   return oracleDbResult;
}

const execute = async (query, accountId) => {
   console.log('Consultando base de datos titular ' + accountId);
   let connection;
   let result;
   try {
      connection = await oracledb.getConnection(dbconfig);
      result = await connection.execute(query);
   } catch (err) {
      console.log('error: ', err);
      return err
   } finally {
   if (connection != null) await connection.close();
   }

   return result;
}

GET_BY_ACCOUNT_ID_AND_DATE_QUERY = `
SELECT RCA_RES_TIT_DOC_NUMERO, RCA_ARCHIVO, RCA_RES_FECHA_VENCIMIENTO FROM RESUMEN.RESUMENES_CUENTA_ARCHIVOS
      WHERE RCA_RES_TIT_DOC_NUMERO = $accountId$ AND
      RCA_RES_FECHA_VENCIMIENTO = to_date('$dateFrom$','yyyy-MM-dd')
`;
GET_BY_ACCOUNT_ID_AND_BETWEEN_DATE_QUERY = `
SELECT RCA_RES_TIT_DOC_NUMERO, RCA_ARCHIVO, RCA_RES_FECHA_VENCIMIENTO FROM RESUMEN.RESUMENES_CUENTA_ARCHIVOS
      WHERE RCA_RES_TIT_DOC_NUMERO = $accountId$ AND
      RCA_RES_FECHA_VENCIMIENTO >= to_date('$dateFrom$','yyyy-MM-dd') AND
      RCA_RES_FECHA_VENCIMIENTO <= to_date('$dateThru$','yyyy-MM-dd')
`;
module.exports = {
   executeQuery
};
