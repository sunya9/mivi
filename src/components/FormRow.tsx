interface Props {
  label: React.ReactNode;
  controller: React.ReactNode;
}

export const FormRow = ({ label, controller }: Props) => {
  return (
    <label className="-mx-6 my-4 flex items-center justify-between px-6">
      <div className="flex-1">{label}</div>
      <div className="flex-none">{controller}</div>
    </label>
  );
};
