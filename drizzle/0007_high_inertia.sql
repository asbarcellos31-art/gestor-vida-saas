CREATE TABLE `hotmart_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hotmartTransactionId` varchar(128) NOT NULL,
	`buyerEmail` varchar(320) NOT NULL,
	`buyerName` text,
	`productId` varchar(64),
	`productName` text,
	`plan` enum('time_management','budget','combo') NOT NULL,
	`status` enum('approved','refunded','cancelled','chargeback') NOT NULL DEFAULT 'approved',
	`userId` int,
	`accessGranted` boolean NOT NULL DEFAULT false,
	`rawPayload` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotmart_purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `hotmart_purchases_hotmartTransactionId_unique` UNIQUE(`hotmartTransactionId`)
);
