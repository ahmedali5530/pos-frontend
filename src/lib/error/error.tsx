export const hasErrors = (errorElement: any) => {
  return errorElement !== undefined;
};

export const getErrors = (errorElemnt: any) => {
  return (
    <>
      {errorElemnt && (
        <div className="text-rose-500 text-sm">
          {errorElemnt.message}
        </div>
      )}
    </>
  );
};

export const getErrorClass = (errorElement: any) => {
  return hasErrors(errorElement) ? 'with-feedback error' : '';
};
