import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId, getCurrentUserId } from "@/lib/company-context";

function fmtDate(d: Date | null): string {
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

function fmtTime(d: Date | null): string {
  if (!d) return "";
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

function serializeEvent(e: Record<string, unknown>): Record<string, unknown> {
  return {
    id: e.id,
    eventName: e.eventName,
    type: e.type,
    startDate: fmtDate(e.startDate as Date),
    endDate: fmtDate(e.endDate as Date),
    time: e.time || fmtTime(e.startDate as Date),
    venue: e.venue || "",
    guests: e.guests,
    status: e.status,
    contact: e.contact || "",
    notes: e.notes || "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const eventType = searchParams.get("eventType") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "200", 10)));

    const where: Record<string, unknown> = { companyId };

    if (status && status !== "All") where.status = status;
    if (eventType && eventType !== "All") where.type = eventType;

    if (dateFrom || dateTo) {
      const startDate: Record<string, Date> = {};
      if (dateFrom) startDate.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        startDate.lte = end;
      }
      where.startDate = startDate;
    }

    if (search) {
      where.OR = [
        { eventName: { contains: search } },
        { venue: { contains: search } },
        { contact: { contains: search } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      events: events.map(serializeEvent),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Event list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();

    const { eventName, type, startDate, endDate, time, venue, guests, status, contact, notes } = body;

    if (!eventName || !eventName.trim()) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 });
    }
    if (!startDate) {
      return NextResponse.json({ error: "Start date is required" }, { status: 400 });
    }
    if (!endDate) {
      return NextResponse.json({ error: "End date is required" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        companyId,
        eventName: eventName.trim(),
        type: type || "Birthday",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        time: time || null,
        venue: venue || null,
        guests: Number(guests) || 0,
        status: status || "Scheduled",
        contact: contact || null,
        notes: notes || null,
        createdByUserId: userId,
        updatedByUserId: userId,
      },
    });

    return NextResponse.json({ success: true, event: serializeEvent(event) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Event create error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const id = parseInt(String(body.id), 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.event.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const data: Record<string, unknown> = { updatedByUserId: userId };

    if (body.eventName !== undefined) data.eventName = String(body.eventName).trim();
    if (body.type !== undefined) data.type = body.type;
    if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) data.endDate = new Date(body.endDate);
    if (body.time !== undefined) data.time = body.time || null;
    if (body.venue !== undefined) data.venue = body.venue || null;
    if (body.guests !== undefined) data.guests = Number(body.guests) || 0;
    if (body.status !== undefined) data.status = body.status;
    if (body.contact !== undefined) data.contact = body.contact || null;
    if (body.notes !== undefined) data.notes = body.notes || null;

    const updated = await prisma.event.update({ where: { id }, data });

    return NextResponse.json({ success: true, event: serializeEvent(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Event update error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCurrentCompanyId();
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0", 10);

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const existing = await prisma.event.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    await prisma.event.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
