export const hasErrors = (errorElement: any) => {
  return errorElement !== undefined;
};

export const getErrors = (errorElement: any) => {
  return (
    <>
      {errorElement && (
        <div className="text-danger-500 text-sm">
          {errorElement.message}
        </div>
      )}
    </>
  );
};

export const getErrorClass = (errorElement: any) => {
  return hasErrors(errorElement) ? 'with-feedback error' : '';
};
