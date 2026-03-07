import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { fdSchema, FDFormValues } from "@/types/schemas";
import { useFinanceStore } from "@/store/useFinanceStore";

export default function FDFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { fds, saveFD } = useFinanceStore((s) => ({ fds: s.fds, saveFD: s.saveFD }));
  const existing = id ? fds.find((f) => f.id === Number(id)) : undefined;

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FDFormValues>({
    resolver: zodResolver(fdSchema),
    defaultValues: {
      holder_name: existing?.holder_name || "Sreejith",
      bank_name: existing?.bank_name || "",
      branch: existing?.branch || "",
      fd_number: existing?.fd_number || "",
      deposit_date: existing?.deposit_date || dayjs().format("YYYY-MM-DD"),
      maturity_date: existing?.maturity_date || dayjs().add(365, "day").format("YYYY-MM-DD"),
      principal: existing?.principal || 0,
      interest_rate: existing?.interest_rate || 7.2,
      payout_type: existing?.payout_type || "Cumulative",
      status: existing?.status || "active",
      funding_type: existing?.funding_type || "Self",
      reserved_for: existing?.reserved_for || "",
      incentive_expected: existing?.incentive_expected || 0,
      incentive_received: existing?.incentive_received || 0,
      notes: existing?.notes || "",
    },
  });

  const depositDate = watch("deposit_date");
  const maturityDate = watch("maturity_date");
  const principal = watch("principal");
  const interestRate = watch("interest_rate");
  const incentiveExpected = watch("incentive_expected");
  const incentiveReceived = watch("incentive_received");
  const tenureDays = dayjs(maturityDate).diff(dayjs(depositDate), "day");
  const maturityExpected = principal + (principal * interestRate * tenureDays) / 36500;
  const incentivePending = incentiveExpected - incentiveReceived;

  return (
    <Screen>
      <Text style={styles.title}>{existing ? "Edit FD" : "Add FD"}</Text>
      <Controller control={control} name="holder_name" render={({ field }) => <FormField label="Holder Name" value={field.value} onChangeText={field.onChange} error={errors.holder_name?.message} />} />
      <Controller control={control} name="bank_name" render={({ field }) => <FormField label="Bank Name" value={field.value} onChangeText={field.onChange} error={errors.bank_name?.message} />} />
      <Controller control={control} name="branch" render={({ field }) => <FormField label="Branch" value={field.value} onChangeText={field.onChange} error={errors.branch?.message} />} />
      <Controller control={control} name="fd_number" render={({ field }) => <FormField label="FD Number" value={field.value} onChangeText={field.onChange} error={errors.fd_number?.message} />} />
      <Controller control={control} name="deposit_date" render={({ field }) => <FormField label="Deposit Date (YYYY-MM-DD)" value={field.value} onChangeText={field.onChange} error={errors.deposit_date?.message} />} />
      <Controller control={control} name="maturity_date" render={({ field }) => <FormField label="Maturity Date (YYYY-MM-DD)" value={field.value} onChangeText={field.onChange} error={errors.maturity_date?.message} />} />
      <Controller control={control} name="principal" render={({ field }) => <FormField label="Principal" value={String(field.value)} onChangeText={(v) => field.onChange(Number(v))} keyboardType="numeric" error={errors.principal?.message} />} />
      <Controller control={control} name="interest_rate" render={({ field }) => <FormField label="Interest Rate (%)" value={String(field.value)} onChangeText={(v) => field.onChange(Number(v))} keyboardType="numeric" error={errors.interest_rate?.message} />} />
      <Controller control={control} name="payout_type" render={({ field }) => <FormField label="Payout Type" value={field.value} onChangeText={field.onChange} error={errors.payout_type?.message} />} />
      <Controller control={control} name="status" render={({ field }) => <FormField label="Status" value={field.value} onChangeText={field.onChange} error={errors.status?.message} />} />
      <Controller control={control} name="funding_type" render={({ field }) => <FormField label="Funding Type (Self/Loan-Backed)" value={field.value} onChangeText={field.onChange} error={errors.funding_type?.message} />} />
      <Controller control={control} name="reserved_for" render={({ field }) => <FormField label="Reserved For (optional)" value={field.value || ""} onChangeText={field.onChange} />} />
      <Controller control={control} name="incentive_expected" render={({ field }) => <FormField label="Incentive Expected" value={String(field.value)} onChangeText={(v) => field.onChange(Number(v))} keyboardType="numeric" />} />
      <Controller control={control} name="incentive_received" render={({ field }) => <FormField label="Incentive Received" value={String(field.value)} onChangeText={(v) => field.onChange(Number(v))} keyboardType="numeric" />} />
      <Controller control={control} name="notes" render={({ field }) => <FormField label="Notes" value={field.value || ""} onChangeText={field.onChange} />} />

      <View style={styles.calcCard}>
        <Text style={styles.calc}>Auto: Tenure days = {tenureDays}</Text>
        <Text style={styles.calc}>Auto: Maturity expected = {maturityExpected.toFixed(0)}</Text>
        <Text style={styles.calc}>Auto: Incentive pending = {incentivePending.toFixed(0)}</Text>
      </View>

      <PrimaryButton
        text={existing ? "Update FD" : "Save FD"}
        onPress={handleSubmit(async (values) => {
          await saveFD({
            id: existing?.id,
            holder_name: values.holder_name,
            bank_name: values.bank_name,
            branch: values.branch,
            fd_number: values.fd_number,
            deposit_date: values.deposit_date,
            maturity_date: values.maturity_date,
            principal: values.principal,
            interest_rate: values.interest_rate,
            tenure_days: tenureDays,
            maturity_value_expected: Number(maturityExpected.toFixed(0)),
            maturity_value_actual: existing?.maturity_value_actual || null,
            payout_type: values.payout_type,
            status: values.status,
            funding_type: values.funding_type,
            linked_loan_id: existing?.linked_loan_id ?? null,
            reserved_for: values.reserved_for || null,
            renewal_flag: existing?.renewal_flag || 0,
            renewal_date: existing?.renewal_date || null,
            renewal_new_fd_amount: existing?.renewal_new_fd_amount || null,
            extra_amount_added: existing?.renewal_new_fd_amount ? existing.renewal_new_fd_amount - values.principal : 0,
            incentive_expected: values.incentive_expected,
            incentive_received: values.incentive_received,
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
  calcCard: { backgroundColor: "#D7F2EE", borderRadius: 12, padding: 12, gap: 4 },
  calc: { color: "#134E4A" },
});
