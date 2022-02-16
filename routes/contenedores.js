var express = require('express');
const { createClient } = require('@supabase/supabase-js')
const { spawn, exec } = require('child_process');
require('dotenv').config()

var router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_HOST,
  process.env.SUPABASE_KEY
);

router.post('/crear', async function(req, res, next) {
  let idContenedor = req.body.idContenedor;
  let contraseña = Math.random().toString(36).slice(-10);
  console.log(req.body);

  const { data, error } = await supabase.from('Instancias').select('*, Versiones(*)').eq('token', idContenedor)
  if (!error) {
    if (!data.length) {
      res.statusCode = 404
      res.json({mensaje: "No se ha encontrado la instancia"})
    } else {
      await supabase.from('Instancias').update({creandose: true}).match({token: data[0].token})
      res.statusCode = 200
      res.json({mensaje: "Se está construyendo la instancia"})
      const lxc = spawn('python3', [`${__dirname}/../contenedores/ubuntu/instanciar.py`, data[0].token, contraseña, data[0].Versiones.nombre], {
        detached: true,
        shell: '/bin/bash'
      });
      lxc.on('close', async (code) => {
        if (!code) {
          await supabase.from('Instancias').update({creandose: false, creada: true}).match({token: data[0].token})
        }
      });
    }
  } else {
    console.log(error)
  }
  
});

module.exports = router;
