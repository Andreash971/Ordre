-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50),
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products_dummy" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50),
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers_dummy" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"phone" varchar(15),
	"business" varchar(50),
	"address" varchar(50),
	"postcode" varchar(4),
	"city" varchar(30),
	"careof" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"phone" varchar(15),
	"business" varchar(50),
	"address" varchar(50),
	"postcode" varchar(4),
	"city" varchar(30),
	"careof" varchar(50)
);

*/