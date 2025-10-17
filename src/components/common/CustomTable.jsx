import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import './CustomTable.css';

const CustomTable = ({
  columns = [],       // [{ key, label, sortable }]
  data = [],          // array of objects
  loading = false,
  onSort,             // (key) => void
  sortBy,
  sortOrder,
  renderActions,      // (row) => JSX
  pagination,         // { currentPage, totalPages, onPageChange }
  noDataMessage = "لا توجد بيانات للعرض"
}) => {

  const getSortIcon = (key) => {
    if (!onSort || !columns.find(col => col.key === key)?.sortable) return null;
    if (sortBy !== key) return <FontAwesomeIcon icon={faSort} />;
    return sortOrder === 'asc' ? (
      <FontAwesomeIcon icon={faSortUp} />
    ) : (
      <FontAwesomeIcon icon={faSortDown} />
    );
  };

  return (
    <div className="custom-table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort?.(col.key)}
                style={{ cursor: col.sortable ? 'pointer' : 'default' }}
              >
                {col.label} {getSortIcon(col.key)}
              </th>
            ))}
            {renderActions && <th>الإجراءات</th>}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + 1} className="loading-row">
                <div className="loading-spinner"></div>
                <p>جاري تحميل البيانات...</p>
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((row, index) => (
              <tr key={row.id || index}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                  </td>
                ))}
                {renderActions && <td>{renderActions(row)}</td>}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="no-data">
                <p>{noDataMessage}</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-page"
            disabled={pagination.currentPage === 1}
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
          >
            السابق
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`btn-page ${page === pagination.currentPage ? 'active' : ''}`}
              onClick={() => pagination.onPageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="btn-page"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomTable;
