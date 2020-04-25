import { useState, useEffect } from 'react';

function useCategoryValidation(categoryNameInputValue: string): [boolean] {
  const [isCategoryNameValid, setIsCategoryNameValid] = useState(false);

  useEffect(() => {
    const trimmedCategoryName = categoryNameInputValue.trim();
    setIsCategoryNameValid(trimmedCategoryName.length >= 4 && trimmedCategoryName.length <= 64);
  }, [categoryNameInputValue, setIsCategoryNameValid]);

  return [isCategoryNameValid];
}

export default useCategoryValidation;
