interface Props {
  Label(): React.ReactNode;
  Controller(): React.ReactNode;
}

export const FormRow = ({ Label, Controller }: Props) => {
  return (
    <label className="-mx-6 my-4 flex items-center justify-between px-6">
      <div className="flex-1">{Label()}</div>
      <div className="flex-none">{Controller()}</div>
    </label>
  );
};
