import React, { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAppStore } from "../stores/useAppStore";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import {
  Search,
  Plus,
  Upload,
  Download,
  Edit2,
  Trash2,
  ChevronRight,
  Phone,
} from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { parseExcel, downloadExcel } from "../lib/excel";

export default function CustomersPage() {
  const navigate = useNavigate();
  const {
    customers,
    contracts,
    payments,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    importCustomers,
    currentUser,
  } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (currentUser?.role === "customer") {
    return <Navigate to="/" replace />;
  }

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery),
  );

  const handleOpenModal = (customer?: any) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", phone: "", address: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone) return;

    if (editingId) {
      updateCustomer(editingId, formData);
    } else {
      addCustomer(formData);
    }
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const exportData = customers.map((c) => {
      const custContracts = contracts.filter(
        (ct) => ct.customerId === c.id && ct.status === "active",
      );
      const balance = custContracts.reduce(
        (sum, ct) => sum + ct.remainingAmount,
        0,
      );
      return {
        ID: c.id,
        Name: c.name,
        Phone: c.phone,
        Address: c.address,
        ActiveContracts: custContracts.length,
        RemainingBalance: balance,
      };
    });
    downloadExcel(exportData, "Customers");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcel(file);
      const newCustomers = data.map((row: any) => ({
        name: row.Name || row.name || "Unknown",
        phone: row.Phone || row.phone || "",
        address: row.Address || row.address || "",
      }));
      importCustomers(newCustomers);
      alert(`Imported ${newCustomers.length} customers`);
    } catch (error) {
      alert("Failed to parse Excel file");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getCustomerStats = (customerId: string) => {
    const custContracts = contracts.filter(
      (c) => c.customerId === customerId && c.status === "active",
    );
    const balance = custContracts.reduce(
      (sum, c) => sum + c.remainingAmount,
      0,
    );
    const paid = payments
      .filter((p) => p.customerId === customerId)
      .reduce((sum, p) => sum + p.amount, 0);
    return { count: custContracts.length, balance, paid };
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button onClick={() => handleOpenModal()} className="flex-1">
          <Plus className="w-4 h-4 mr-2 ml-0" /> إضافة
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx, .xls"
          onChange={handleImport}
        />
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2 ml-0" /> استيراد
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          className="pr-10 text-right"
          placeholder="ابحث عن العملاء..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3 mt-4">
        {filteredCustomers.map((customer) => {
          const stats = getCustomerStats(customer.id);
          return (
            <Card
              key={customer.id}
              className="relative !p-0 overflow-hidden group"
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => navigate(`/customers/${customer.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                    {customer.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {customer.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      {customer.phone}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-50 dark:border-gray-800/50 pt-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                      العقود النشطة
                    </div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {stats.count}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                      المتبقي
                    </div>
                    <div className="font-medium text-rose-600 dark:text-rose-400">
                      {formatCurrency(stats.balance)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                      الواصل
                    </div>
                    <div className="font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(stats.paid)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(customer);
                  }}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-gray-800 shadow-sm rounded-full"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("هل تريد حذف العميل؟"))
                      deleteCustomer(customer.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-gray-800 shadow-sm rounded-full"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            لم يتم العثور على عملاء
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "تعديل العميل" : "إضافة عميل"}
      >
        <div className="space-y-4">
          <Input
            label="الاسم الكامل"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="رقم الهاتف"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
          <Input
            label="العنوان"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
          <Button fullWidth onClick={handleSave} className="mt-4">
            {editingId ? "حفظ التغييرات" : "إضافة عميل"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
