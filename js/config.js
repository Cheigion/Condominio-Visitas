// ===== CONFIGURACIÓN: pegue aquí sus enlaces =====
const CONFIG = {
  // Google Sheet "Condominio-usuarios" publicado como CSV
  USERS_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREYMXOOqNBLwrGPdrPbGTJhkwYJV-2DyEhfzLdnLtMRiqXwNbVmRHjiBrLRFbPmfpRBjeTAFTjMw7W/pub?gid=1659959888&single=true&output=csv",
  // Google Sheet "Condominio-registros" publicado como CSV
  VISITS_CSV_URL: "https://docs.google.com/spreadsheets/d/1MhDvQvMWaJoAgXMTLz8KKyk7mauldd_uwj6dzo_w1oI/gviz/tq?tqx=out:csv&sheet=Registros",
  // Endpoint (Custom webhook) de Make.com que agrega la fila en Condominio-registros
  MAKE_WEBHOOK_URL: "https://hook.us2.make.com/8w2anwqlot4gz8qb2gmpl0wg99acplpy",
  TIMEZONE: "America/Santiago",
  REVALIDATE_MINUTES: 10
};
