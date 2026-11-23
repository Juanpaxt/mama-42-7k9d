# Un regalo para mamá · 42

Página de cumpleaños hecha a medida, pensada para abrirse desde el celular.

## Qué incluye

- Portada con regalo para abrir y lluvia de confeti.
- Foto de 2021 enmarcada como polaroid.
- Carta escrita a mano.
- Tres cartitas que se voltean al tocarlas.
- Pastel con velas 4 y 2 para soplar y pedir un deseo.
- Cupones de cumpleaños.
- Música instrumental generada por la propia página (sin archivos externos).
- Diseño responsive, accesible y con soporte para `prefers-reduced-motion`.

## Ver en local

```bash
cd regalo-mama
python3 -m http.server 8765
```

Abre <http://localhost:8765>.

Para revisar secciones sin la portada de apertura: `/?preview=1`.

## Cambiar la foto de 2021

1. Guarda la foto nueva en la computadora.
2. Ejecuta:

```bash
./add-photo.sh "/ruta/a/la/foto.jpg"
```

El script corrige la orientación, la deja en un tamaño apto para celular y elimina los metadatos (incluida la ubicación GPS si la tuviera).

3. Publica el cambio:

```bash
git add assets/foto.jpg
git commit -m "Agregar foto de mamá"
git push
```

GitHub Pages actualiza el sitio solo en uno o dos minutos.

## Publicación

El sitio se publica con GitHub Pages desde la rama `main`. La dirección está en el archivo del proyecto y en el mensaje de entrega.

## Privacidad

La página está pensada como un enlace no listado:

- `robots.txt` bloquea a los buscadores.
- La página incluye `<meta name="robots" content="noindex, nofollow">`.
- La URL no está enlazada desde ningún otro sitio.

Aun así, **cualquier persona que tenga el enlace puede verla**, y el repositorio es público porque GitHub Pages gratuito lo requiere. No la compartas fuera de la familia. Si más adelante quieres protegerla con una clave, se puede agregar.
