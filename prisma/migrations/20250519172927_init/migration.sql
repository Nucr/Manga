-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ONGOING', 'COMPLETED', 'HIATUS', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MangaType" AS ENUM ('MANGA', 'MANHWA', 'MANHUA', 'NOVEL');

-- CreateEnum
CREATE TYPE "MangaGenre" AS ENUM ('ACTION', 'ADVENTURE', 'COMEDY', 'DRAMA', 'FANTASY', 'HORROR', 'MYSTERY', 'ROMANCE', 'SCIFI', 'SLICE_OF_LIFE', 'SUPERNATURAL', 'THRILLER', 'SPORTS', 'ECCHI', 'HAREM', 'ISEKAI', 'MECHA', 'PSYCHOLOGICAL', 'SHOUNEN', 'SHOUJO', 'SEINEN', 'JOSEI', 'YAOI', 'YURI', 'GENDER_BENDER', 'HISTORICAL', 'MAGICAL', 'MARTIAL_ARTS', 'MUSIC', 'SCHOOL', 'VAMPIRE', 'ZOMBIE', 'FINAL');

-- CreateTable
CREATE TABLE "manga" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "type" "MangaType" NOT NULL,
    "coverImage" TEXT,
    "genres" "MangaGenre"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "manga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "number" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mangaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MangaCategory" (
    "id" TEXT NOT NULL,
    "mangaId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MangaCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manga_slug_key" ON "manga"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MangaCategory_mangaId_categoryId_key" ON "MangaCategory"("mangaId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaCategory" ADD CONSTRAINT "MangaCategory_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "manga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaCategory" ADD CONSTRAINT "MangaCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
