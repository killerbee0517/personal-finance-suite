import { z } from "zod";

export const fdSchema = z.object({
  holder_name: z.string().min(2),
  bank_name: z.string().min(2),
  branch: z.string().min(1),
  fd_number: z.string().min(2),
  deposit_date: z.string().min(10),
  maturity_date: z.string().min(10),
  principal: z.coerce.number().positive(),
  interest_rate: z.coerce.number().positive(),
  payout_type: z.string().min(2),
  status: z.string().min(2),
  funding_type: z.string().min(2),
  reserved_for: z.string().optional(),
  incentive_expected: z.coerce.number().min(0),
  incentive_received: z.coerce.number().min(0),
  notes: z.string().optional(),
});

export type FDFormValues = z.infer<typeof fdSchema>;

export const loanSchema = z.object({
  loan_type: z.string().min(2),
  holder_name: z.string().min(2),
  bank_name: z.string().min(2),
  account_number: z.string().min(2),
  start_date: z.string().min(10),
  end_date: z.string().min(10),
  principal_amount: z.coerce.number().positive(),
  interest_rate: z.coerce.number().positive(),
  repayment_type: z.string().min(2),
  emi_amount: z.coerce.number().optional(),
  outstanding_principal: z.coerce.number().min(0),
  bullet_closure_amount: z.coerce.number().optional(),
  status: z.string().min(2),
  notes: z.string().optional(),
});

export type LoanFormValues = z.infer<typeof loanSchema>;
