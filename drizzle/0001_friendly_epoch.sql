CREATE TABLE `budget_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('income','fixed_expense','variable_expense') NOT NULL,
	`rule5030Category` enum('essential','lifestyle','investment'),
	`category` varchar(100) NOT NULL,
	`description` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`month` varchar(7) NOT NULL,
	`isPaid` boolean NOT NULL DEFAULT false,
	`dueDay` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`totalParcels` int NOT NULL,
	`paidParcels` int NOT NULL DEFAULT 0,
	`monthlyValue` decimal(12,2) NOT NULL,
	`startMonth` varchar(7) NOT NULL,
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`category` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `retirement_projections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentAge` int NOT NULL,
	`retirementAge` int NOT NULL,
	`currentSavings` decimal(15,2) NOT NULL DEFAULT '0',
	`monthlyContribution` decimal(12,2) NOT NULL,
	`scenario1Rate` decimal(5,2) NOT NULL DEFAULT '10.00',
	`scenario1Result` decimal(15,2),
	`scenario1MonthlyIncome` decimal(12,2),
	`scenario2Rate` decimal(5,2) NOT NULL DEFAULT '14.00',
	`scenario2Result` decimal(15,2),
	`scenario2MonthlyIncome` decimal(12,2),
	`scenario3Rate` decimal(5,2) NOT NULL DEFAULT '18.00',
	`scenario3Result` decimal(15,2),
	`scenario3MonthlyIncome` decimal(12,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `retirement_projections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('time_management','budget','combo') NOT NULL,
	`status` enum('active','cancelled','expired','trialing') NOT NULL DEFAULT 'active',
	`stripeCustomerId` varchar(128),
	`stripeSubscriptionId` varchar(128),
	`stripePriceId` varchar(128),
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`durationMinutes` int NOT NULL DEFAULT 30,
	`category` enum('important','urgent','circumstantial') NOT NULL DEFAULT 'important',
	`status` enum('pending','started','completed') NOT NULL DEFAULT 'pending',
	`scheduledDate` date NOT NULL,
	`executedMinutes` int NOT NULL DEFAULT 0,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `time_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`userId` int NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`endedAt` timestamp,
	`durationMinutes` int NOT NULL DEFAULT 0,
	CONSTRAINT `time_sessions_id` PRIMARY KEY(`id`)
);
