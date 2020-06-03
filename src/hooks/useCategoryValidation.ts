import { useState, useEffect } from 'react';

/**
 * Validates category data and returns validation state for each validated field
 * @param categoryNameInputValue Category name
 */
function useCategoryValidation(categoryNameInputValue: string): [boolean] {
  const [isCategoryNameValid, setIsCategoryNameValid] = useState(false);

  useEffect(() => {
    const trimmedCategoryName = categoryNameInputValue.trim();
    setIsCategoryNameValid(trimmedCategoryName.length >= 4 && trimmedCategoryName.length <= 64);
  }, [categoryNameInputValue, setIsCategoryNameValid]);

  return [isCategoryNameValid];
}

export default useCategoryValidation;
