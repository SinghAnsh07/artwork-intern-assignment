import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import type { Artwork, SelectionState } from './types/artwork';
import { fetchArtworks } from './services/artworkApi';
import CustomSelectionPanel from './components/CustomSelectionPanel';
import './App.css';
import './styles/primeReactCustom.css';

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage] = useState(12);

  // track selected/deselected across pages
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedIds: new Set(),
    deselectedIds: new Set()
  });

  const overlayPanelRef = useRef<OverlayPanel>(null);

  useEffect(() => {
    loadArtworks(currentPage);
  }, [currentPage]);

  const loadArtworks = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchArtworks(page);
      setArtworks(response.data);
      setTotalRecords(response.pagination.total);
    } catch (err) {
      setError('Failed to load artworks. Please try again.');
      console.error('Error loading artworks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedRowsOnCurrentPage = () => {
    return artworks.filter(artwork => {
      if (selectionState.deselectedIds.has(artwork.id)) return false;
      if (selectionState.selectedIds.has(artwork.id)) return true;
      return false;
    });
  };

  const handleSelectionChange = (e: { value: Artwork[] }) => {
    const currentSelectedIds = new Set(e.value.map(artwork => artwork.id));
    const newSelectedIds = new Set(selectionState.selectedIds);
    const newDeselectedIds = new Set(selectionState.deselectedIds);

    artworks.forEach(artwork => {
      const isSelected = currentSelectedIds.has(artwork.id);
      if (isSelected) {
        newSelectedIds.add(artwork.id);
        newDeselectedIds.delete(artwork.id);
      } else {
        newSelectedIds.delete(artwork.id);
        newDeselectedIds.add(artwork.id);
      }
    });

    setSelectionState({
      selectedIds: newSelectedIds,
      deselectedIds: newDeselectedIds
    });
  };

  // handles custom row selection across multiple pages
  const handleCustomSelection = async (count: number) => {
    const newSelectedIds = new Set<number>();
    const newDeselectedIds = new Set<number>();
    let remaining = count;
    let page = 1;

    try {
      while (remaining > 0) {
        let pageData: Artwork[];

        // use cached data if we're on current page
        if (page === currentPage) {
          pageData = artworks;
        } else {
          const response = await fetchArtworks(page);
          pageData = response.data;
        }

        const toSelect = Math.min(remaining, pageData.length);
        pageData.slice(0, toSelect).forEach(artwork => {
          newSelectedIds.add(artwork.id);
        });

        remaining -= toSelect;
        if (remaining > 0 && pageData.length === rowsPerPage) {
          page++;
        } else {
          break;
        }
      }

      setSelectionState({
        selectedIds: newSelectedIds,
        deselectedIds: newDeselectedIds
      });
    } catch (error) {
      console.error('Error during custom selection:', error);
    }
  };

  const onPageChange = (event: { page?: number; first: number; rows: number }) => {
    if (event.page !== undefined) {
      setCurrentPage(event.page + 1);
    }
  };

  const formatValue = (value: string | number | null) => {
    return value !== null && value !== undefined && value !== '' ? String(value) : 'N/A';
  };

  if (error) {
    return (
      <div className="app-container">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <div className="error-message">{error}</div>
          <button className="retry-btn" onClick={() => loadArtworks(currentPage)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="data-table-container">
          <div className="selection-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="selection-count" style={{ color: '#666', fontWeight: 500 }}>
              {selectionState.selectedIds.size > 0 ? `Selected : ${selectionState.selectedIds.size}` : 'Selected : 0'}
            </span>
            <button
              className="p-link"
              onClick={(e) => overlayPanelRef.current?.toggle(e)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              <i className="pi pi-chevron-down" style={{ fontSize: '0.8rem', color: '#666' }}></i>
            </button>
          </div>

          <CustomSelectionPanel
            overlayRef={overlayPanelRef}
            onSelect={handleCustomSelection}
            currentPageSize={artworks.length}
          />

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading artworks...</p>
            </div>
          ) : (
            <DataTable
              value={artworks}
              selection={getSelectedRowsOnCurrentPage()}
              onSelectionChange={handleSelectionChange as any}
              selectionMode="multiple"
              dataKey="id"
              paginator
              rows={rowsPerPage}
              totalRecords={totalRecords}
              lazy
              first={(currentPage - 1) * rowsPerPage}
              onPage={onPageChange as any}
              paginatorTemplate="CurrentPageReport PrevPageLink PageLinks NextPageLink"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              emptyMessage="No artworks found"
              stripedRows
            >
              <Column
                selectionMode="multiple"
                headerStyle={{ width: '3rem' }}
              />
              <Column
                field="title"
                header="Title"
                body={(rowData) => formatValue(rowData.title)}
                style={{ minWidth: '200px' }}
              />
              <Column
                field="place_of_origin"
                header="Place of Origin"
                body={(rowData) => formatValue(rowData.place_of_origin)}
                style={{ minWidth: '150px' }}
              />
              <Column
                field="artist_display"
                header="Artist"
                body={(rowData) => formatValue(rowData.artist_display)}
                style={{ minWidth: '200px' }}
              />
              <Column
                field="inscriptions"
                header="Inscriptions"
                body={(rowData) => formatValue(rowData.inscriptions)}
                style={{ minWidth: '150px' }}
              />
              <Column
                field="date_start"
                header="Start Date"
                body={(rowData) => formatValue(rowData.date_start)}
                style={{ minWidth: '120px' }}
              />
              <Column
                field="date_end"
                header="End Date"
                body={(rowData) => formatValue(rowData.date_end)}
                style={{ minWidth: '120px' }}
              />
            </DataTable>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
