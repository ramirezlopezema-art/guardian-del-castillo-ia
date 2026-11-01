# El Guardián del Castillo

Juego educativo en español para explorar cómo un modelo muy sencillo puede
detectar el tono de un mensaje buscando palabras en un vocabulario.

## Cómo jugar

1. Abre `index.html` en un navegador moderno. No requiere instalación, servidor,
   conexión a internet ni claves API.
2. Escribe un mensaje de hasta 120 caracteres y pulsa **Enviar** o Enter.
3. Revisa las palabras detectadas y la puntuación que aparece debajo de tu texto.
4. Prueba distintos mensajes: cada palabra amable suma 1 a la puntuación y cada
   palabra hostil resta 1. La confianza cambia 3 puntos por cada punto de
   puntuación; un mensaje sin coincidencias resta 2.
5. Llega a 100 de confianza para conseguir la llave. Si la confianza llega a 0,
   el guardián cierra la entrada. Pulsa **Volver a jugar** para reiniciar.

## Cómo funciona

- `index.html` contiene la interfaz y las instrucciones.
- `cerebro.js` normaliza el texto (mayúsculas, tildes y signos) y compara sus
  palabras con dos listas editables de vocabulario.
- `juego.js` actualiza la conversación, la confianza y los finales a partir del
  resultado del análisis.
- `style.css` define el diseño adaptable para móvil y escritorio.

Para ampliar el vocabulario, añade palabras normalizadas (sin tildes) al
`Set` positivo o negativo en `cerebro.js`. Las listas son reglas transparentes
para aprender; no constituyen una IA que comprende contexto, ironía o
intenciones. Todo el juego funciona localmente en el navegador.