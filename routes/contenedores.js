var express = require('express');
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()
const { exec } = require('child_process');

var router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_HOST,
  process.env.SUPABASE_KEY
);

router.post('/crear', async function(req, res, next) {
  let idContenedor = req.body.idContenedor;
  let contraseña = Math.random().toString(36).slice(-10);
  let port = Math.floor(Math.random() * 20000 + 1);
  let version;
  let plantilla;
  console.log(req.body);

  const { data, error } = await supabase.from('Instancias').select('*, Versiones(*), Plantillas(*)').eq('token', idContenedor)
  if (!error) {
    if (!data.length) {
      res.statusCode = 404
      res.json({mensaje: "No se ha encontrado la instancia"})
    } else {
      version = data[0].Versiones.nombre;
      plantilla = data[0].Plantillas.nombre.toLowerCase();
      await supabase.from('Instancias').update({creandose: true}).match({token: idContenedor})
      res.statusCode = 200
      res.json({mensaje: "Se está construyendo la instancia"})
      exec(`docker run --name ${idContenedor} -d -p ${port}:22 undernightcore/${plantilla}:${version}`, async (error, stdout, stderr) => {
        await supabase.from('Instancias').update({creandose: false, creada: true, port}).match({token: idContenedor})
        exec(`docker exec ${idContenedor} useradd -s /bin/bash -g sudo -p $(openssl passwd -1 ${contraseña}) admin`, async (error, stdout, stderr) => {
          await supabase.from('Instancias').update({password: contraseña}).match({token: idContenedor})
        });
      });
    }
  } else {
    res.statusCode = 500
    res.json({mensaje: "No se ha podido crear la instancia"})
  }
});

router.delete('/eliminar', async function(req, res, next) {
  let idContenedor = req.body.idContenedor;

  const { data, error } = await supabase.from('Instancias').select('*, Versiones(*)').eq('token', idContenedor)
  if (!error) {
    if (!data.length) {
      res.statusCode = 404
      res.json({mensaje: "No se ha encontrado la instancia"})
    } else {
      res.statusCode = 200
      res.json({mensaje: "Se está eliminando la instancia"})
      exec(`docker exec ${idContenedor} service ssh stop`, async (error, stdout, stderr) => {
        await supabase.from('Instancias').delete().match({token: idContenedor})
      });
    }
  } else {
    res.statusCode = 500
    res.json({mensaje: "No se ha podido eliminar la instancia"})
  }
  
});

module.exports = router;
