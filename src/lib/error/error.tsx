export const hasErrors = (errorElement: any) => {
  return errorElement !== undefined;
};

export const getErrors = (errorElemnt: any) => {
  return (
    <>
      {errorElemnt && (
        <div className="invalid-feedback d-block">
          {errorElemnt.message}
        </div>
      )}
    </>
  );
};

export const getErrorClass = (errorElement: any) => {
  return hasErrors(errorElement) ? 'is-invalid' : '';
};
