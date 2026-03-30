# 🌐 Trabajo Práctico: Implementación de Infraestructura de Red (Web + DNS)

## 📋 Contexto

En este ejercicio simulamos el funcionamiento de una infraestructura de red real mediante la configuración manual de dos servicios fundamentales: un servidor web que publica sitios virtuales y un servidor DNS que resuelve los nombres de dominio.

Todo el entorno se ejecuta exclusivamente utilizando binarios portables, archivos de configuración y la línea de comandos, sin depender de instaladores ni servicios en segundo plano del sistema operativo.

---

## 🎯 Objetivo General

Lograr que cualquier equipo cliente en la red local, configurando su DNS preferido hacia nuestro servidor DNS local, pueda acceder a tres sitios web distintos utilizando sus nombres de dominio, **sin modificar el archivo `hosts` del cliente**. Adicionalmente, el servidor DNS debe ser capaz de resolver dominios públicos (como Google o YouTube) mediante *forwarding*.

### Sitios a resolver (apuntando a la IP del Servidor Web):

- `http://www.ipfformosa.com`
- `http://www.fiestaipf2026.com`
- `http://www.climaformosa.com`

---

## 👥 Equipo de Trabajo y Roles

| Máquina | Rol | Responsable |
|--------|-----|-------------|
| **Máquina A** | Servidor Web | Colman, Maximo |
| **Máquina B** | Servidor DNS | Pereyra Roman, Ramiro |
| **Máquina C** | Cliente | Zigaran, Lucas |

---

## 🚀 Ejecución Paso a Paso

### 🖥️ Máquina A — Configuración del Servidor Web (Apache)
**Responsable:** Colman, Maximo

**1. Preparación del entorno**

Se descargaron los archivos binarios portables provistos por la cátedra.

**2. Configuración principal**

Se editó el archivo `httpd.conf` para definir la directiva `SRVROOT` apuntando al directorio contenedor:

```apache
SRVROOT "C:/portable/Apache24"
```

Luego se habilitó la lectura de la configuración de hosts virtuales descomentando la línea:

```apache
Include conf/extra/httpd-vhosts.conf
```

**3. Configuración de Virtual Hosts**

Se editó el archivo `httpd-vhosts.conf` para definir los tres sitios solicitados, asignando el `ServerName` y el `DocumentRoot` correspondiente a cada uno:

```apache
<VirtualHost *:80>
    ServerName www.ipfformosa.com
    DocumentRoot "C:/portable/Apache24/htdocs/sitio-ipfformosa"
</VirtualHost>

<VirtualHost *:80>
    ServerName www.fiestaipf2026.com
    DocumentRoot "C:/portable/Apache24/htdocs/sitio-fiestaipf2026"
</VirtualHost>

<VirtualHost *:80>
    ServerName www.climaformosa.com
    DocumentRoot "C:/portable/Apache24/htdocs/sitio-climaformosa"
</VirtualHost>
```

**4. Despliegue de los sitios**

Se ubicaron las carpetas con los archivos HTML en las rutas especificadas dentro de `htdocs`.

**5. Ejecución**

Desde una consola de comandos (CMD) con privilegios de administrador, se inició el binario de Apache en primer plano:

```cmd
httpd.exe
```

---

### ⚙️ Máquina B — Configuración del Servidor DNS (CoreDNS)
**Responsable:** Pereyra Roman, Ramiro

**1. Preparación del entorno**

Dentro del directorio portable, se preparó la carpeta `dns` que contiene:
- `coredns.exe` — binario del servidor DNS
- `Corefile` — archivo de configuración principal
- `hosts-ipf.txt` — tabla de resolución local

**2. Mapeo de dominios (`hosts-ipf.txt`)**

Se editó el archivo para vincular los nombres de dominio con la IP de la Máquina A.
> ⚠️ Reemplazar `192.168.X.X` por la IP real de la Máquina A.

```
192.168.X.X   www.ipfformosa.com
192.168.X.X   www.fiestaipf2026.com
192.168.X.X   www.climaformosa.com
```

**3. Ejecución**

Desde una consola CMD como administrador, se inició CoreDNS indicándole que lea el archivo de configuración:

```cmd
coredns.exe -conf Corefile
```

El servicio queda corriendo en una ventana visible.

---

### 💻 Máquina C — Verificación del Cliente
**Responsable:** Zigaran, Lucas

**1. Configuración de red**

Se modificaron las propiedades del adaptador de red del sistema operativo, estableciendo como **Servidor DNS Preferido** la dirección IP de la Máquina B.

**2. Prueba de resolución local**

Se abrió un navegador web y se ingresó a los dominios configurados:

- `www.ipfformosa.com` ✅
- `www.fiestaipf2026.com` ✅
- `www.climaformosa.com` ✅

Las páginas cargaron exitosamente, servidas por la Máquina A.

**3. Prueba de resolución externa**

Se ingresó a dominios públicos (ej. `www.google.com`) para verificar que la configuración de *forwarding* en el `Corefile` funciona correctamente, permitiendo la navegación normal en internet. ✅
