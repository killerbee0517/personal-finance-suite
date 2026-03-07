import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text } from "react-native";
import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useFinanceStore } from "@/store/useFinanceStore";
import { loanSchema, LoanFormValues } from "@/types/schemas";

export default function LoanFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { loans, saveLoan } = useFinanceStore((s) => ({ loans: s.loans, saveLoan: s.saveLoan }));
  const existing = id ? loans.find((l) => l.id === Number(id)) : undefined;

  const { control, handleSubmit, formState: { errors } } = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      loan_type: existing?.loan_type || "LAP",
      holder_name: existing?.holder_name || "Sreejith",
      bank_name: existing?.bank_name || "",
      account_number: existing?.account_number || "",
      start_date: existing?.start_date || dayjs().subtract(1, "month").format("YYYY-MM-DD"),
      end_date: existing?.end_date || dayjs().add(12, "month").format("YYYY-MM-DD"),
      principal_amount: existing?.principal_amount || 0,
      interest_rate: existing?.interest_rate || 10,
      repayment_type: existing?.repayment_type || "EMI",
      emi_amount: existing?.emi_amount || 0,
      outstanding_principal: existing?.outstanding_principal || 0,
      bullet_closure_amount: existing?.bullet_closure_amount || 0,
      status: existing?.status || "active",
      notes: existing?.notes || "",
    },
  });

  return (
    <Screen>
      <Text style={styles.title}>{existing ? "Edit Loan" : "Add Loan"}</Text>
      <Controller control={control} name="loan_type" render={({ field }) => <FormField label="Loan Type" value={field.value} onChangeText={field.onChange} error={errors.loan_type?.message} />} />
      <Controller control={control} name="holder_name" render={({ field }) => <FormField label="Holder Name" value={field.value} onChangeText={field.onChange} error={errors.holder_name?.message} />} />
      <Controller control={control} name="bank_name" render={({ field }) => <FormField label="Bank Name" value={field.value} onChangeText={field.onChange} error={errors.bank_name?.message} />} />
      <Controller control={control} name="account_number" render={({ field }) => <FormField label="Account Number" value={field.value} onChangeText={field.onChange} error={errors.account_number?.message} />} />
      <Controller control={control} name="start_date" render={({ field }) => <FormField label="Start Date (YYYY-MM-DD)" value={field.value} onChangeText={field.onChange} error={errors.start_date?.message} />} />
      <Controller control={control} name="end_date" render={({ field }) => <FormField label="End Date (YYYY-MM-DD)" value={field.value} onChangeText={field.onChange} error={errors.end_date?.message} />} />
      <Controller control={control} name="principal_amount" render={({ field }) => <FormField label="Principal Amount" value={String(field.value)} onChangeText={(v) => field.onChange(Number(v))} keyboardType="numeric" error={errors.principal_amount?.message} />} />
      <Controller control={control} name="interest_rate" render={({ field }) => <FormField label="Interest Rate (%)" value={String(field.value)} onChangeText={(v) => field.onChange(Number(v))} keyboardType="numeric" error={errors.interest_rate?.message} />} />
      <Controller control={control} name="repayment_type" render={({ field }) => <FormField label="Repayment Type" value={field.value} onChangeText={field.onChange} error={errors.repayment_type?.message} />} />
      <Controller control={control} name="emi_amount" render={({ field }) => <FormField label="EMI Amount" value={String(field.value || 0)} onChangeText={(v) => field.onChange(Number(v))} keyboardType="numeric" />} />
      <Controller control={control} name="outstanding_principal" render={({ field }) => <FormField label="Outstanding Principal" value={String(field.value)} onChangeText={(v) => field.onChange(Number(v))} keyboardType="numeric" error={errors.outstanding_principal?.message} />} />
      <Controller control={control} name="bullet_closure_amount" render={({ field }) => <FormField label="Bullet Closure Amount" value={String(field.value || 0)} onChangeText={(v) => field.onChange(Number(v))} keyboardType="numeric" />} />
      <Controller control={control} name="status" render={({ field }) => <FormField label="Status" value={field.value} onChangeText={field.onChange} />} />
      <Controller control={control} name="notes" render={({ field }) => <FormField label="Notes" value={field.value || ""} onChangeText={field.onChange} />} />
      <PrimaryButton
        text={existing ? "Update Loan" : "Save Loan"}
        onPress={handleSubmit(async (values) => {
          await saveLoan({
            id: existing?.id,
            loan_type: values.loan_type,
            holder_name: values.holder_name,
            bank_name: values.bank_name,
            account_number: values.account_number,
            start_date: values.start_date,
            end_date: values.end_date,
            principal_amount: values.principal_amount,
            interest_rate: values.interest_rate,
            repayment_type: values.repayment_type,
            emi_amount: values.emi_amount || 0,
            outstanding_principal: values.outstanding_principal,
            bullet_closure_amount: values.bullet_closure_amount || 0,
            status: values.status,
            notes: values.notes || null,
          });
          router.back();
        })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800" },
});
