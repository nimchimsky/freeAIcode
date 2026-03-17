CREATE TABLE IF NOT EXISTS "benchmark_score" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "benchmark_score_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"canonical_model_id" integer NOT NULL,
	"source_name" text NOT NULL,
	"metric_name" text NOT NULL,
	"raw_value" real NOT NULL,
	"normalized_value" real NOT NULL,
	"source_url" text NOT NULL,
	"source_confidence" real NOT NULL,
	"measured_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "canonical_model" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "canonical_model_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"canonical_slug" text NOT NULL,
	"display_name" text NOT NULL,
	"organization" text,
	"family" text,
	"release_status" text,
	"description" text,
	"context_window" integer,
	"architecture_supports_tools" boolean DEFAULT false,
	"supports_vision" boolean DEFAULT false,
	"supports_reasoning" boolean DEFAULT false,
	"supports_structured_outputs" boolean DEFAULT false,
	"supports_fim" boolean DEFAULT false,
	"open_weights" boolean DEFAULT false,
	"coding_utility_score" real,
	"best_value_score" real,
	"benchmark_confidence" real,
	"benchmark_display_status" text,
	"last_benchmark_refresh_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "canonical_model_canonical_slug_unique" UNIQUE("canonical_slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "change_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "change_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"field_name" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"source" text NOT NULL,
	"reason" text,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connector_cache" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "connector_cache_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"connector_name" text NOT NULL,
	"cache_key" text NOT NULL,
	"payload" jsonb NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "manual_override" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "manual_override_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"field_name" text NOT NULL,
	"override_value" text NOT NULL,
	"reason" text NOT NULL,
	"expires_at" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "model_alias" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "model_alias_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"canonical_model_id" integer NOT NULL,
	"alias" text NOT NULL,
	"alias_normalized" text NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "price_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "price_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"provider_offer_id" integer NOT NULL,
	"input_price_per_million" real,
	"output_price_per_million" real,
	"effective_price_per_million" real,
	"captured_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "provider" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "provider_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"website_url" text,
	"docs_url" text,
	"api_base_url" text,
	"open_ai_compatible" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "provider_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "provider_offer" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "provider_offer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"canonical_model_id" integer NOT NULL,
	"provider_id" integer NOT NULL,
	"provider_model_id" text NOT NULL,
	"access_type" text NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"input_price_per_million" real,
	"output_price_per_million" real,
	"effective_price_per_million" real,
	"free_limit_text" text,
	"rate_limit_text" text,
	"byok_supported" boolean DEFAULT false,
	"open_ai_compatible" boolean DEFAULT false,
	"endpoint_exposes_tool_calling" boolean DEFAULT false,
	"streaming_supported" boolean DEFAULT true,
	"context_window_override" integer,
	"provider_speed_score" real,
	"provider_latency_score" real,
	"provider_reliability_score" real,
	"region_notes" text,
	"deprecated" boolean DEFAULT false,
	"deprecation_reason" text,
	"last_checked_at" timestamp DEFAULT now() NOT NULL,
	"source_url" text NOT NULL,
	"source_type" text NOT NULL,
	"source_confidence" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "refresh_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "refresh_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"connector_name" text NOT NULL,
	"started_at" timestamp NOT NULL,
	"finished_at" timestamp,
	"status" text NOT NULL,
	"summary" text,
	"error_message" text,
	"records_created" integer DEFAULT 0,
	"records_updated" integer DEFAULT 0,
	"records_flagged" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "source_review_queue" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "source_review_queue_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source_name" text NOT NULL,
	"entity_type" text NOT NULL,
	"raw_payload" jsonb NOT NULL,
	"issue_type" text NOT NULL,
	"resolution_status" text DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "benchmark_score" ADD CONSTRAINT "benchmark_score_canonical_model_id_canonical_model_id_fk" FOREIGN KEY ("canonical_model_id") REFERENCES "public"."canonical_model"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "model_alias" ADD CONSTRAINT "model_alias_canonical_model_id_canonical_model_id_fk" FOREIGN KEY ("canonical_model_id") REFERENCES "public"."canonical_model"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price_history" ADD CONSTRAINT "price_history_provider_offer_id_provider_offer_id_fk" FOREIGN KEY ("provider_offer_id") REFERENCES "public"."provider_offer"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "provider_offer" ADD CONSTRAINT "provider_offer_canonical_model_id_canonical_model_id_fk" FOREIGN KEY ("canonical_model_id") REFERENCES "public"."canonical_model"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "provider_offer" ADD CONSTRAINT "provider_offer_provider_id_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."provider"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "benchmark_score_model_source_idx" ON "benchmark_score" USING btree ("canonical_model_id","source_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "canonical_model_slug_idx" ON "canonical_model" USING btree ("canonical_slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "canonical_model_org_idx" ON "canonical_model" USING btree ("organization");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "canonical_model_score_idx" ON "canonical_model" USING btree ("coding_utility_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "canonical_model_value_idx" ON "canonical_model" USING btree ("best_value_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "change_log_entity_idx" ON "change_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "change_log_changed_idx" ON "change_log" USING btree ("changed_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "connector_cache_connector_key_idx" ON "connector_cache" USING btree ("connector_name","cache_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "connector_cache_expires_idx" ON "connector_cache" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "manual_override_entity_idx" ON "manual_override" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "manual_override_expires_idx" ON "manual_override" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "model_alias_alias_idx" ON "model_alias" USING btree ("alias_normalized");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "model_alias_canonical_idx" ON "model_alias" USING btree ("canonical_model_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "price_history_offer_idx" ON "price_history" USING btree ("provider_offer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "price_history_captured_idx" ON "price_history" USING btree ("captured_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "provider_slug_idx" ON "provider" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_type_idx" ON "provider" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_offer_model_provider_idx" ON "provider_offer" USING btree ("canonical_model_id","provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_offer_provider_idx" ON "provider_offer" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_offer_free_idx" ON "provider_offer" USING btree ("is_free");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_offer_price_idx" ON "provider_offer" USING btree ("effective_price_per_million");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_offer_deprecated_idx" ON "provider_offer" USING btree ("deprecated");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_log_connector_idx" ON "refresh_log" USING btree ("connector_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_log_status_idx" ON "refresh_log" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_log_started_idx" ON "refresh_log" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "source_review_queue_status_idx" ON "source_review_queue" USING btree ("resolution_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "source_review_queue_created_idx" ON "source_review_queue" USING btree ("created_at");