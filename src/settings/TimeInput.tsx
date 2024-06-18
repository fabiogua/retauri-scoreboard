function TimeInput({value}: {value: string}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  };
  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
        }
    }
      }
    />
  );
}

export default TimeInput;