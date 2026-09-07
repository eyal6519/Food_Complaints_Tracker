import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getComputedStatus, getDaysPending } from '@/types/complaint';

export async function GET() {
  try {
    const complaints = await db.getComplaints();

    const headers = [
      'ID',
      'Status',
      'Days Pending',
      'Category',
      'Supplier Name',
      'Warehouse Name',
      'Date Received by Us',
      'Date Sent to Supplier',
      'Date Response Received',
      'Description',
      'Notes',
      'Logged By',
      'Resolved By',
      'Last Updated By',
      'Created At'
    ];

    const escapeCsv = (str: string | null | undefined): string => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = complaints.map((c) => {
      const status = getComputedStatus(c);
      const daysPending = status === 'RESOLVED' ? '-' : getDaysPending(c.dateSentToSupplier);
      return [
        escapeCsv(c.id),
        escapeCsv(status),
        escapeCsv(String(daysPending)),
        escapeCsv(c.category),
        escapeCsv(c.supplierName),
        escapeCsv(c.warehouseName),
        escapeCsv(c.dateSentToUs),
        escapeCsv(c.dateSentToSupplier),
        escapeCsv(c.dateResponseReceived || 'N/A'),
        escapeCsv(c.description),
        escapeCsv(c.notes || ''),
        escapeCsv(c.createdBy || 'Unknown'),
        escapeCsv(c.resolvedBy || (status === 'RESOLVED' ? 'Unknown' : 'N/A')),
        escapeCsv(c.updatedBy || ''),
        escapeCsv(c.createdAt)
      ].join(',');
    });

    // Add UTF-8 BOM (\uFEFF) for Excel compatibility
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

    const filename = `complaints_export_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to export CSV: ' + String(error) },
      { status: 500 }
    );
  }
}
