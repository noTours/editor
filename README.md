noTours editor 1.03
===================


 
noTours editor (http://www.editor.notours.org/) by Horacio González Diéguez is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 (http://creativecommons.org/licenses/by-nc-sa/3.0/)

Date: Fri Nov 20 2015

For academic reasons we would like to know about all projects that have been made based on noTours, please write an email and let us know about yours. Enjoy the code and drop us a line for any comments and questions! 
horaciogd at vhplab dot net

Third Part components:  jQuery v1.4.4 - *jQuery Foundation*, Google Maps API v3, jQuery.ScrollTo - *Ariel Flesler*
 


Development Notes
-----------------
1.01
cambio del nombre de la propiedad class por type en el objeto NotoursSoundpoint y en la tabla `notours_object` para evitar conflitos en safari
cambio del nombre del método delete por del para evitar conflitos en safari
cambio del nombre del método export por zip para evitar conflitos en safari
cambio del nombre de metodo sufix del objeto NotoursAttributes y de la funcion sufix por getSufix para evitar conflictos al comprimir el código javascript
se revisa el metodo zip para que devuelva el archivo comprimido en la misma ventana y el archivo export_project.php para que devualva una respuesta jsp adecuada
1.02
en upload_sound.php y upload_icon.php se cambia la ubicación del script javascript a la cabecera del documento
en upload_sound.php y upload_icon.php no se había cambiado el nombre de la función sufix por getSufix
añadido un if soundscape al metodo set de SoundDragControl para mostras los arcos en aquellos sonidos que sean soundscape al volver a un proyecto.
1.03
Se añade soporte para superponer documentos klm en una capa del mapa
Se optimizan los documentos para subir sonidos, iconos y klm (upload_icon.html, upload_klm.html, upload_sound.html) de modo ya no es necesario que sean .php
Se optimiza y reduce el código del documento update_project.php por medio de una nueva función project_atachments(); que se utiliza tanto en la actualización como en la creación de nuevos proyectos
se añade un valor por defecto a los angulos de un soundscape de modo que no aparezcan los valores "undefined undefined" al crearlos.


al borrar varios proyectos el los enlaces del menu principal comienzan a fallar (debería estar arreglado con los if null)
campo color a cada marcador
revisar el borrado de proyectos (offline documents and force)
gestion de los zindex de los circulos en funcion de ???
eliminar los var temporales con evals !?(mas bien tratar de llevar todo lo posible a los métodos de los objetos)
el campo sonido es obligatorio. (dinámicas de aviso rojo azul echas pero en un futuro se puede pensar otra solución)
añadir ruta local al player para reproducir archivos locales
añadir clases de autor debugger premiun standard (ya estan creada, empezar a gestionar los privilegios)
al salir de un proyecto y volver al mismo los arcos del soundscape quedan a la vista incluso en los soundpoints
poner un mni icono de save en el texto preliminar para
la css del soundpoint/soundscape se ha roto esta pegado a la izquierda y no se ve gris

