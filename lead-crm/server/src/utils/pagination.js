function parsePagination(query, defaults = { page: 1, limit: 20, maxLimit: 100 }) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isFinite(page) || page < 1) page = defaults.page;
  if (!Number.isFinite(limit) || limit < 1) limit = defaults.limit;
  if (limit > defaults.maxLimit) limit = defaults.maxLimit;

  return { page, limit, skip: (page - 1) * limit };
}

function paginatedResult(items, total, page, limit) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

module.exports = { parsePagination, paginatedResult };
