export const validateDateRange = (startDate, endDate) => {
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error("Start date cannot be after end date");
  }
  return true;
};

export const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  }
  return input;
};

export const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    throw new Error("Invalid pagination parameters");
  }

  return { page: pageNum, limit: limitNum };
};
