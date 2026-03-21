import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerStep1Schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone_number: z
      .string()
      .transform((s) => s.replace(/\s/g, ""))
      .pipe(z.string().regex(/^\d{10,15}$/, "Enter a valid mobile number")),
    country_code: z.string().regex(/^\+\d{1,4}$/, "Invalid country code"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    type: z.enum(["individual", "group"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const profileBase = z.object({
  bio: z.string().min(5, "Bio is too short"),
  rate: z.coerce.number().positive("Enter a valid rate"),
  city_id: z.string().uuid("Select a valid city"),
  interests: z.array(z.string()).min(3, "Select at least 3 interests"),
});

export const registerStep2IndividualSchema = profileBase.extend({
  type: z.literal("individual"),
  age: z.coerce.number().int().min(13, "Enter a valid age").max(120, "Enter a valid age"),
});

export const registerStep2GroupSchema = profileBase.extend({
  type: z.literal("group"),
  groupName: z.string().min(2, "Group name is required"),
  members: z.coerce.number().int().min(1, "Enter number of members"),
  groupType: z.string().min(1, "Select group type"),
  contactName: z.string().min(2, "Contact name is required"),
  age: z.coerce.number().int().min(13, "Enter a valid age").max(120, "Enter a valid age"),
  contactMobile: z
    .string()
    .transform((s) => s.replace(/\s/g, ""))
    .pipe(z.string().regex(/^\d{10,15}$/, "Enter a valid contact mobile")),
  contact_country_code: z.string().regex(/^\+\d{1,4}$/, "Invalid country code"),
});

export const registerGalleryStepSchema = z.object({
  count: z.number().min(3, "Upload at least 3 gallery photos"),
});

/** Step 3: at least one day marked available */
export const registerAvailabilityStepSchema = z
  .object({
    days: z.record(
      z.string(),
      z.object({
        on: z.boolean(),
        slot: z.string().optional(),
      })
    ),
  })
  .superRefine((data, ctx) => {
    if (!Object.values(data.days || {}).some((d) => d?.on)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one available day",
        path: ["availability"],
      });
    }
  });

export const registerOtpSchema = z.object({
  otp_code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
});

/** Final payload sent to POST /user/register (OTP emailed separately) */
export const registerApiPayloadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  type: z.enum(["individual", "group"]),
  country_code: z.string(),
  phone_number: z.string(),
  bio: z.string(),
  rate: z.number(),
  city_id: z.string().uuid(),
  age: z.number().nullable().optional(),
  interest_ids: z.array(z.string().uuid()).min(1),
  profile_path: z.string().optional().nullable(),
  profile_photos: z.array(z.string()).optional(),
  availability: z.string().optional().nullable(),
  // Group-specific fields (optional unless `type === 'group'`)
  group_name: z.string().optional().nullable(),
  group_type: z.string().optional().nullable(),
  members: z.coerce.number().int().min(1).optional().nullable(),
  contact_name: z.string().optional().nullable(),
  contact_mobile: z.string().optional().nullable(),
  contact_country_code: z.string().optional().nullable(),
});
