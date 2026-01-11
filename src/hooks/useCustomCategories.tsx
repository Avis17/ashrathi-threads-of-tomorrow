// Stub hook for custom categories - used by admin forms
export const useCustomCategories = () => {
  const getCategories = (operation: string) => {
    return [];
  };

  const addCustomCategory = (operation: string, category: { name: string; rate: number }) => {
    // No-op stub
  };

  return {
    categories: [],
    isLoading: false,
    error: null,
    getCategories,
    addCustomCategory,
  };
};
