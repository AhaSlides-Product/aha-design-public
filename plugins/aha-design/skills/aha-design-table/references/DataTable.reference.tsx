/**
 * DataTable — the ONE canonical AhaSlides data grid.
 * =================================================================
 * Reference implementation of the Design System V3 table. Every data grid in
 * AhaSlides product UI renders through this component; a raw AntD <Table> styled
 * per call site, or a hand-rolled <table>/<div> grid, is a violation
 * (see aha-design-table / aha-design-table-judge).
 *
 * This file is a REFERENCE — copy it into the app's shared component layer
 * (e.g. `frontend/src/components/DataTable/`) and wire the tokens/icons to the
 * repo's real theme. It is intentionally self-contained and lightly commented so
 * the canonical decisions are visible in one place.
 *
 * Anchor decisions (all from DS V3, mapped to the --aha-* / AntD theme):
 *   • WHITE header + secondary-grey labels + bottom divider — NOT AntD's #fafafa fill.
 *   • Horizontal dividers only (#e3e3e3). No vertical grid lines. No zebra striping.
 *   • Radius 8, 16px cell padding, brand-tinted row hover.
 *   • Single directional SORT arrow (DS V3) — not AntD's default dual caret.
 *   • Filter popover: multi-select checklist (with search) OR Min/Max range,
 *     each with a Reset link + Apply primary button.
 *   • Column reorder by drag (handle + purple drop-line + ghost).
 *   • Freeze: right-click a header → Freeze/Defreeze; one column at a time; a
 *     frozen column pins left with a shadow and can no longer be reordered.
 *   • Icons from @phosphor-icons/react — never emoji.
 *   • Toolbar: optional title (left) + actions e.g. Edit columns / Export (right).
 *   • Pagination: brand-outlined active page + "N / page" size changer.
 */
import { useMemo, useRef, useState } from 'react';
import { Table, Button, Input, InputNumber, Checkbox, Dropdown, Space, theme } from 'antd';
import type { TableProps, TableColumnType } from 'antd';
// House icon set — @ant-design/icons and emoji are BOTH banned (see aha-design-icons).
import {
  Question, FunnelSimple, ArrowDown, ArrowUp, MagnifyingGlass,
  PushPin, PencilSimple, DownloadSimple, DotsSixVertical,
} from '@phosphor-icons/react';

export type DataTableColumn<T> = TableColumnType<T> & {
  /** Stable key used for reorder + freeze bookkeeping. */
  key: string;
  /** Short help text shown behind the header's (?) affordance. */
  help?: string;
  /** Filter shape. Omit for no filter. */
  filter?: { type: 'checklist'; options: string[] } | { type: 'range' };
};

export interface DataTableProps<T> extends Omit<TableProps<T>, 'columns' | 'title'> {
  columns: DataTableColumn<T>[];
  toolbarTitle?: string;
  /** Right-aligned toolbar actions — pass house <Button>s (e.g. Edit columns, Export). */
  toolbarActions?: React.ReactNode;
  /** Enable drag-to-reorder columns. */
  reorderable?: boolean;
  /** Enable right-click freeze/defreeze. */
  freezable?: boolean;
}

/* --- DS V3 sort icon: a single directional arrow, not AntD's dual caret --- */
function SortIcon({ sortOrder }: { sortOrder?: 'ascend' | 'descend' | null }) {
  const { token } = theme.useToken();
  if (sortOrder === 'ascend') return <ArrowUp size={14} color={token.colorText} />;
  if (sortOrder === 'descend') return <ArrowDown size={14} color={token.colorText} />;
  return <ArrowDown size={14} color={token.colorTextQuaternary} />; // idle: faint down
}

/* --- Multi-select checklist filter: search + checkboxes + Reset / Apply --- */
function ChecklistFilter(props: any) {
  const { options, selectedKeys, setSelectedKeys, confirm, clearFilters } = props;
  const [q, setQ] = useState('');
  const shown = options.filter((o: string) => o.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ width: 232, padding: '4px 0' }}>
      <div style={{ padding: '8px 12px' }}>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search in filters"
          prefix={<MagnifyingGlass size={16} />}
          allowClear
        />
      </div>
      <div style={{ maxHeight: 180, overflow: 'auto', padding: '2px 12px' }}>
        <Checkbox.Group
          value={selectedKeys}
          onChange={setSelectedKeys}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {shown.map((o: string) => (
            <Checkbox key={o} value={o}>{o}</Checkbox>
          ))}
        </Checkbox.Group>
      </div>
      <PopoverFooter onReset={() => { clearFilters?.(); setQ(''); confirm(); }} onApply={() => confirm()} />
    </div>
  );
}

/* --- Min / Max range filter --- */
function RangeFilter(props: any) {
  const { selectedKeys, setSelectedKeys, confirm, clearFilters } = props;
  const [min, max] = selectedKeys[0]
    ? selectedKeys[0].split('|').map((v: string) => (v === '' ? null : Number(v)))
    : [null, null];
  const set = (mn: number | null, mx: number | null) => setSelectedKeys([`${mn ?? ''}|${mx ?? ''}`]);
  return (
    <div style={{ width: 248, padding: '12px 14px' }}>
      <div style={{ fontSize: 13 }}>Min value</div>
      <InputNumber value={min} onChange={(v) => set(v as number, max)} style={{ width: '100%', marginTop: 6 }} />
      <div style={{ fontSize: 13, marginTop: 12 }}>Max value</div>
      <InputNumber value={max} onChange={(v) => set(min, v as number)} style={{ width: '100%', marginTop: 6 }} />
      <PopoverFooter onReset={() => { clearFilters?.(); confirm(); }} onApply={() => confirm()} />
    </div>
  );
}

function PopoverFooter({ onReset, onApply }: { onReset: () => void; onApply: () => void }) {
  const { token } = theme.useToken();
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 12px 4px', borderTop: `1px solid ${token.colorBorderSecondary}`, marginTop: 6,
    }}>
      <Button type="text" size="small" style={{ color: token.colorTextTertiary }} onClick={onReset}>Reset</Button>
      <Button type="primary" size="small" onClick={onApply}>Apply</Button>
    </div>
  );
}

/* --- Draggable + right-click-freeze header cell --- */
function HeaderCell(props: any) {
  const { onReorder, frozenKey, onFreeze, draggableKey, children, ...rest } = props;
  const ref = useRef<HTMLTableCellElement>(null);
  const [side, setSide] = useState<'left' | 'right' | null>(null);
  const isFrozen = frozenKey === draggableKey;

  const dragProps = draggableKey && onReorder ? {
    draggable: !isFrozen,
    onDragStart: (e: React.DragEvent) => e.dataTransfer.setData('col', draggableKey),
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      const r = ref.current!.getBoundingClientRect();
      setSide(e.clientX < r.left + r.width / 2 ? 'left' : 'right');
    },
    onDragLeave: () => setSide(null),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const from = e.dataTransfer.getData('col');
      if (from && from !== draggableKey) onReorder(from, draggableKey, side);
      setSide(null);
    },
    'data-drag-side': side ?? undefined,
  } : {};

  const cell = <th {...rest} {...dragProps} ref={ref}>{children}</th>;
  if (!draggableKey || !onFreeze) return cell;
  return (
    <Dropdown
      trigger={['contextMenu']}
      menu={{
        items: [{ key: 'freeze', label: isFrozen ? 'Defreeze column' : 'Freeze column', icon: <PushPin size={16} /> }],
        onClick: () => onFreeze(isFrozen ? null : draggableKey),
      }}
    >
      {cell}
    </Dropdown>
  );
}

export function DataTable<T extends { key: React.Key }>(props: DataTableProps<T>) {
  const { columns, toolbarTitle, toolbarActions, reorderable, freezable, ...rest } = props;
  const { token } = theme.useToken();

  const [order, setOrder] = useState<string[]>(columns.map((c) => c.key));
  const [frozenKey, setFrozenKey] = useState<string | null>(null);

  const reorder = (from: string, to: string, side: 'left' | 'right' | null) =>
    setOrder((prev) => {
      const next = prev.filter((k) => k !== from);
      let idx = next.indexOf(to);
      if (side === 'right') idx += 1;
      next.splice(idx, 0, from);
      return next;
    });

  const byKey = useMemo(() => Object.fromEntries(columns.map((c) => [c.key, c])), [columns]);

  const finalColumns = useMemo(() => {
    const ordered = frozenKey ? [frozenKey, ...order.filter((k) => k !== frozenKey)] : order;
    return ordered.map((key) => {
      const c = byKey[key];
      const filterDropdown = c.filter
        ? (p: any) =>
            c.filter!.type === 'checklist'
              ? <ChecklistFilter options={(c.filter as any).options} {...p} />
              : <RangeFilter {...p} />
        : undefined;
      return {
        ...c,
        title: c.help
          ? <Space size={6}>{c.title as React.ReactNode}<Question size={14} color={token.colorTextTertiary} /></Space>
          : c.title,
        fixed: frozenKey === key ? ('left' as const) : undefined,
        sortIcon: c.sorter ? ({ sortOrder }: any) => <SortIcon sortOrder={sortOrder} /> : undefined,
        filterDropdown,
        filterIcon: c.filter ? (filtered: boolean) => (
          <FunnelSimple size={16} color={filtered ? token.colorPrimary : token.colorTextTertiary} />
        ) : undefined,
        onHeaderCell: () => ({
          draggableKey: key,
          onReorder: reorderable ? reorder : undefined,
          frozenKey,
          onFreeze: freezable ? setFrozenKey : undefined,
        }),
      } as DataTableColumn<T>;
    });
  }, [order, frozenKey, byKey, reorderable, freezable, token]);

  return (
    <div
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,          // 8 — from the token scale, never hardcoded
        overflow: 'hidden',
      }}
    >
      {(toolbarTitle || toolbarActions) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: token.colorText }}>{toolbarTitle}</span>
          <Space>{toolbarActions}</Space>
        </div>
      )}
      <Table<T>
        columns={finalColumns as any}
        components={{ header: { cell: HeaderCell } }}
        pagination={{ pageSize: 10, showSizeChanger: true, ...(rest.pagination as object) }}
        {...rest}
      />
    </div>
  );
}

/**
 * The theme block below is the SINGLE source of the DS V3 look. It lives ONCE in
 * the app theme (frontend/src/theme/index.ts, components.Table) — NOT re-declared
 * per call site. Reproduced here so the canonical values are visible with the
 * component that depends on them.
 *
 *   components: {
 *     Table: {
 *       headerBg: '#ffffff',              // white header — colorBgContainer, NOT #fafafa
 *       headerColor: '#8a8a8a',           // secondary-grey labels — colorTextSecondary
 *       headerSplitColor: 'transparent',  // no vertical separators in the header
 *       borderColor: '#e3e3e3',           // horizontal dividers — colorBorderSecondary
 *       rowHoverBg: '#f9f5ff',            // brand-tinted hover — colorPrimaryBg
 *       cellPaddingBlock: 16,             // paddingM
 *       cellPaddingInline: 16,
 *       headerBorderRadius: 0,
 *     },
 *   }
 *
 * Example call site — note there is NO per-table styling:
 *
 *   <DataTable
 *     toolbarTitle="Table title"
 *     toolbarActions={<>
 *       <Button icon={<PencilSimple size={16} />}>Edit columns</Button>
 *       <Button icon={<DownloadSimple size={16} />}>Export</Button>
 *     </>}
 *     reorderable freezable
 *     rowKey="key"
 *     dataSource={rows}
 *     columns={[
 *       { key: 'name', title: t('col.name'), dataIndex: 'name', sorter: byName, help: t('help.name') },
 *       { key: 'team', title: t('col.team'), dataIndex: 'team', filter: { type: 'checklist', options: teams } },
 *       { key: 'responses', title: t('col.responses'), dataIndex: 'responses', sorter: byN, filter: { type: 'range' } },
 *     ]}
 *   />
 */
