CREATE TABLE `bill_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`year` int NOT NULL,
	`month` tinyint NOT NULL,
	`billKey` varchar(64) NOT NULL,
	`paid` boolean NOT NULL DEFAULT false,
	`paidDate` varchar(10),
	`amount` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bill_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`rule` enum('Essenciai') NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expense_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`year` int NOT NULL,
	`month` tinyint NOT NULL,
	`category` varchar(64) NOT NULL,
	`description` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`expenseDate` varchar(10),
	`obs` varchar(500),
	`paymentMethod` varchar(32),
	`installmentGroupId` varchar(36),
	`installmentNumber` tinyint,
	`installmentTotal` tinyint,
	`memberId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expense_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`color` varchar(32) NOT NULL DEFAULT '#6366f1',
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fixed_bill_labels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`billKey` varchar(64) NOT NULL,
	`label` varchar(128) NOT NULL,
	`hidden` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fixed_bill_labels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fixed_bills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`year` int NOT NULL,
	`month` tinyint NOT NULL,
	`billKey` varchar(64) NOT NULL,
	`amount` decimal(12,2) NOT NULL DEFAULT '0',
	`paid` boolean NOT NULL DEFAULT false,
	`paidDate` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fixed_bills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `income_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`year` int NOT NULL,
	`month` tinyint NOT NULL,
	`description` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`category` varchar(64),
	`memberId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `income_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installment_bills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`installmentAmount` decimal(12,2) NOT NULL,
	`totalInstallments` int NOT NULL,
	`currentInstallment` int NOT NULL DEFAULT 1,
	`startYear` int NOT NULL,
	`startMonth` tinyint NOT NULL,
	`category` varchar(64) NOT NULL DEFAULT 'Parcelados',
	`paymentMethod` varchar(64) NOT NULL DEFAULT 'cartao_1',
	`paid` boolean NOT NULL DEFAULT false,
	`isRecurring` boolean NOT NULL DEFAULT false,
	`memberId` int,
	`paidMonths` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installment_bills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`key` varchar(64) NOT NULL,
	`label` varchar(64) NOT NULL,
	`icon` varchar(8) NOT NULL DEFAULT '💳',
	`colorClass` varchar(128) NOT NULL DEFAULT 'bg-gray-100 text-gray-700 border-gray-300',
	`isCard` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`reminderDate` varchar(10) NOT NULL,
	`reminderTime` varchar(5) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `retirement_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`birthDate` varchar(10) NOT NULL DEFAULT '',
	`retirementAge` int NOT NULL DEFAULT 65,
	`yearsUntilRetirement` int,
	`useYearsMode` boolean NOT NULL DEFAULT false,
	`initialAmount` decimal(12,2) NOT NULL DEFAULT '0',
	`monthlyContribution` decimal(12,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `retirement_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `retirement_config_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `task_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`emoji` varchar(8) NOT NULL DEFAULT '📋',
	`color` varchar(32) NOT NULL DEFAULT '#6366f1',
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `task_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `budget_entries` MODIFY COLUMN `type` enum('income','expense','bill') NOT NULL;--> statement-breakpoint
ALTER TABLE `budget_entries` MODIFY COLUMN `rule5030Category` varchar(64);--> statement-breakpoint
ALTER TABLE `budget_entries` MODIFY COLUMN `category` varchar(64);--> statement-breakpoint
ALTER TABLE `budget_entries` MODIFY COLUMN `month` int NOT NULL;--> statement-breakpoint
ALTER TABLE `installments` MODIFY COLUMN `startMonth` int NOT NULL;--> statement-breakpoint
ALTER TABLE `installments` MODIFY COLUMN `category` varchar(64);--> statement-breakpoint
ALTER TABLE `retirement_projections` MODIFY COLUMN `currentSavings` decimal(12,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `retirement_projections` MODIFY COLUMN `scenario1Rate` decimal(5,2);--> statement-breakpoint
ALTER TABLE `retirement_projections` MODIFY COLUMN `scenario2Rate` decimal(5,2);--> statement-breakpoint
ALTER TABLE `retirement_projections` MODIFY COLUMN `scenario3Rate` decimal(5,2);--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `scheduledDate` varchar(10);--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `executedMinutes` int;--> statement-breakpoint
ALTER TABLE `time_sessions` MODIFY COLUMN `startedAt` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `time_sessions` MODIFY COLUMN `durationMinutes` int;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `trialEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `tasks` ADD `taskCategoryId` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `scheduledTime` varchar(5);--> statement-breakpoint
ALTER TABLE `tasks` ADD `isRecurring` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_unique` UNIQUE(`userId`);