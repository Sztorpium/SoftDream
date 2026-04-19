# SoftDream – Hotel Foglalási Rendszer

A SoftDream egy full-stack szállodai foglalási alkalmazás, amelyet **Spring Boot** (backend) és **React + Vite** (frontend) technológiákkal készítettünk.

---

## Tartalomjegyzék

1. [Rendszerkövetelmények](#1-rendszerkövetelmények)
2. [Projekt felépítése](#2-projekt-felépítése)
3. [Backend indítása (fejlesztői mód – H2)](#3-backend-indítása-fejlesztői-mód--h2)
4. [Backend indítása (MySQL)](#4-backend-indítása-mysql)
5. [Frontend indítása](#5-frontend-indítása)
6. [Környezeti változók](#6-környezeti-változók)
7. [Alapértelmezett felhasználók](#7-alapértelmezett-felhasználók)
8. [Tesztek futtatása](#8-tesztek-futtatása)
9. [API dokumentáció (Swagger)](#9-api-dokumentáció-swagger)
10. [Production / Railway deployment](#10-production--railway-deployment)

---

## 1. Rendszerkövetelmények

| Eszköz | Minimum verzió |
|--------|----------------|
| Java (JDK) | 21 |
| Maven | 3.9+ (vagy a mellékelt `mvnw`) |
| Node.js | 18+ |
| npm | 9+ |
| MySQL *(opcionális)* | 8.0+ |

> **Tipp:** A fejlesztői profilhoz (`dev`) **nem szükséges** telepített adatbázis – beépített H2 memória-adatbázist használ.
---

## 2. Projekt felépítése

```
SoftDream/
├── src/                        # Spring Boot backend (Maven projekt)
│   ├── main/java/hu/softdream/ # Java forráskód
│   └── main/resources/         # Konfigurációs fájlok
├── frontend/                   # React + Vite frontend
│   ├── src/
│   └── package.json
└── pom.xml
```

---

## 3. Backend indítása (fejlesztői mód – H2)

Ez a legegyszerűbb módszer: **nem kell külső adatbázis**, az alkalmazás egy beépített H2 memória-adatbázist indít.

### Lépések

```bash
# A projekt gyökérkönyvtárában:
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Windows esetén:
```bat
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

Az alkalmazás elindul a **http://localhost:8080** címen.

A H2 webes konzol (csak `dev` profilban) elérhető: **http://localhost:8080/h2-console**
- JDBC URL: `jdbc:h2:mem:softdream_hotel`
- Felhasználónév: `sa`
- Jelszó: *(üres)*

> **Megjegyzés:** A `dev` profil `create-drop` sémát használ, tehát az alkalmazás leállításakor az adatok törlődnek.
---

## 4. Backend indítása (MySQL)

### Előfeltételek

- Futó MySQL szerver (pl. XAMPP, helyi MySQL telepítés)
- A `softdream_hotel` adatbázis **automatikusan létrejön** az első indításkor

### `.env` fájl létrehozása (ajánlott)

A projekt gyökérkönyvtárában hozz létre egy `.env` fájlt a szükséges titkok megadásához:

```dotenv
# JWT titkosítási kulcs – Base64-kódolt, legalább 256 bites érték legyen
JWT_SECRET=dGhpc2lzYXZlcnlsb25nand0c2VjcmV0a2V5Zm9yc29mdGRyZWFtYXBwbGljYXRpb24h
# Admin jelszó (alapértelmezett: admin123 – VÁLTOZTASD MEG!)
ADMIN_PASSWORD=admin123
# E-mail küldéshez (Gmail SMTP) – hagyhatod üresen helyi tesztelésnél
MAIL_USERNAME=
MAIL_PASSWORD=
```

### Indítás MySQL profillal

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

Az alkalmazás automatikusan csatlakozik a `localhost:3306/softdream_hotel` adatbázishoz.

> Ha más MySQL felhasználónevet vagy jelszót használsz, módosítsd a `src/main/resources/application-mysql.properties` fájlban a `spring.datasource.username` és `spring.datasource.password` értékeket.
---

## 5. Frontend indítása

```bash
# Navigálj a frontend könyvtárba
cd frontend

# Függőségek telepítése (csak első alkalommal)
npm install

# Fejlesztői szerver indítása
npm run dev
```

A frontend elérhető: **http://localhost:5173**

A Vite dev-szerver automatikusan proxy-zza az `/api` kéréseket a `http://localhost:8080` backendre, ezért **nincs szükség külön CORS-beállításra** helyi fejlesztéskor.

### Opcionális: Frontend `.env.local` fájl

Ha a backend nem `localhost:8080`-on fut, hozz létre egy `.env.local` fájlt a `frontend/` könyvtárban:

```bash
cp frontend/.env.example frontend/.env.local
```

Majd szerkeszd meg:
```dotenv
VITE_API_BASE_URL=http://localhost:8080
```

### Production build

```bash
cd frontend
npm run build
```

A lefordított fájlok a `frontend/dist/` könyvtárba kerülnek.

---

## 6. Környezeti változók

### Backend

| Változó | Leírás | Alapértelmezett |
|---------|--------|-----------------|
| `JWT_SECRET` | Base64-kódolt JWT titkosítási kulcs (≥256 bit) | Beépített fejlesztői kulcs |
| `JWT_EXPIRATION` | Token élettartama milliszekundumban | `86400000` (24 óra) |
| `ADMIN_PASSWORD` | Az admin felhasználó jelszava | `admin123` |
| `CORS_ALLOWED_ORIGINS` | Engedélyezett CORS originek (vesszővel elválasztva) | `http://localhost:5173` és társai |
| `MAIL_USERNAME` | Gmail SMTP felhasználónév | *(üres – e-mail letiltva)* |
| `MAIL_PASSWORD` | Gmail SMTP jelszó vagy App Password | *(üres)* |

> ⚠️ **Figyelem:** Éles (production) környezetben mindig állítsd be a `JWT_SECRET` és `ADMIN_PASSWORD` változókat! Soha ne hagyd az alapértelmezett értékeket!
### Frontend

| Változó | Leírás | Alapértelmezett |
|---------|--------|-----------------|
| `VITE_API_BASE_URL` | A Spring Boot backend alap URL-je | *(Vite proxy használata)* |

---

## 7. Alapértelmezett felhasználók

Az alkalmazás induláskor automatikusan létrehozza az alábbi felhasználókat:

| Felhasználónév | Jelszó | Szerepkör |
|----------------|--------|-----------|
| `admin_user` | `admin123` | ADMIN |
| `john_doe` | `user123` | USER |
| `jane_smith` | `user123` | USER |
| `peter_kovacs` | `user123` | USER |
| `maria_szabo` | `user123` | USER |

> Az admin jelszó az `ADMIN_PASSWORD` környezeti változóval felülírható.
---

## 8. Tesztek futtatása

### Integrációs és unit tesztek (backend)

```bash
./mvnw test
```

A tesztek automatikusan a `dev` és `integration` Spring profilokat aktiválják, H2 memória-adatbázist használnak, és az e-mail küldést mock-olják. **Nem szükséges futó adatbázis a tesztekhez.**

### Frontend lint

```bash
cd frontend
npm run lint
```

---

## 9. API dokumentáció (Swagger)

Az alkalmazás futása közben az API dokumentáció elérhető:

**http://localhost:8080/swagger-ui/index.html**

Az összes végpont, kérés- és válaszstruktúra itt böngészhető és kipróbálható.

---

## 10. Production / Railway deployment

Az alkalmazás Railway.app platformra is deployolható PostgreSQL adatbázissal.

### Szükséges környezeti változók Railway-en

```dotenv
SPRING_PROFILES_ACTIVE=railway
DATABASE_URL=postgresql://...    # Railway automatikusan beállítja
JWT_SECRET=<erős-base64-kulcs>
ADMIN_PASSWORD=<erős-jelszó>
CORS_ALLOWED_ORIGINS=https://a-te-frontended.com
MAIL_USERNAME=gmail-cimed@gmail.com
MAIL_PASSWORD=gmail-app-jelszo
```

A `railway` profil automatikusan PostgreSQL dialektust és connection poolinget konfigurál.

---

## Gyors összefoglaló – helyi fejlesztés

```bash
# 1. Backend indítása (H2, nincs szükség MySQL-re)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# 2. Frontend indítása (új terminálablakban)
cd frontend && npm install && npm run dev
```

Ezután:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- H2 konzol: http://localhost:8080/h2-console