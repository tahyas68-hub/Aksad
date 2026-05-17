import React, { useState, useRef } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Search, Plus, Upload, Download, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { parseExcel, downloadExcel } from '../lib/excel';

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct, importProducts } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', stock: '', category: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.stock || !formData.category) return;
    
    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category
    };

    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct(payload);
    }
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const exportData = products.map(p => ({
      ID: p.id,
      Name: p.name,
      Category: p.category,
      Price: p.price,
      Stock: p.stock,
      Status: p.status
    }));
    downloadExcel(exportData, 'Inventory');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcel(file);
      const newProducts = data.map((row: any) => ({
        name: row.Name || row.name || 'Unknown',
        price: parseFloat(row.Price || row.price || 0),
        stock: parseInt(row.Stock || row.stock || 0),
        category: row.Category || row.category || 'General'
      }));
      importProducts(newProducts);
      alert(`Imported ${newProducts.length} products`);
    } catch (error) {
      alert('Failed to parse Excel file');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button onClick={() => handleOpenModal()} className="flex-1">
          <Plus className="w-4 h-4 mr-2 ml-0" /> إضافة
        </Button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleImport} />
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
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
          placeholder="ابحث عن المنتجات..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3 mt-4">
        {filteredProducts.map(product => (
          <Card key={product.id} className="flex items-center gap-4 !p-4">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl overflow-hidden relative">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : '📦'}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{product.name}</h3>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category}</div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(product.price)}</span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{product.stock} في المخزون</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <Badge variant={product.status === 'available' ? 'success' : 'danger'}>
                {product.status === 'available' ? 'متاح' : 'نفذ'}
              </Badge>
              <div className="flex items-center gap-1">
                <button onClick={() => handleOpenModal(product)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-50 dark:bg-gray-800 rounded-full">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { if(confirm('هل تريد حذف المنتج؟')) deleteProduct(product.id) }} className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 bg-gray-50 dark:bg-gray-800 rounded-full">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-400">لم يتم العثور على منتجات</div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'تعديل المنتج' : 'إضافة منتج'}>
        <div className="space-y-4">
          <Input 
            label="اسم المنتج" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
          <Select 
            label="التصنيف" 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="">اختر التصنيف</option>
            <option value="Electronics">إلكترونيات</option>
            <option value="Appliances">أجهزة منزلية</option>
            <option value="Furniture">أثاث</option>
            <option value="Motors">محركات</option>
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="السعر (د.ع)" 
              type="number" 
              value={formData.price} 
              onChange={(e) => setFormData({...formData, price: e.target.value})} 
            />
            <Input 
              label="كمية المخزون" 
              type="number" 
              value={formData.stock} 
              onChange={(e) => setFormData({...formData, stock: e.target.value})} 
            />
          </div>
          <Button fullWidth onClick={handleSave} className="mt-4">
            {editingId ? 'حفظ التغييرات' : 'إضافة منتج'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
