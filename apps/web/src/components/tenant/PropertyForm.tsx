'use client';
import { Button } from '@/components/ui/button';
import { PropertyBasicFields } from './PropertyBasicFields';
import { PropertyLocationFields } from './PropertyLocationFields';
import { PropertyImageUpload } from './PropertyImageUpload';
import { PropertyFormInitData } from './property-schema';
import { usePropertyCategories } from './usePropertyCategories';
import { usePropertyForm } from './usePropertyForm';

export type { PropertyFormInitData } from './property-schema';

export default function PropertyForm({
  initialData,
  onCancel,
}: {
  initialData?: PropertyFormInitData;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const categories = usePropertyCategories();
  const form = usePropertyForm(initialData);

  return (
    <form onSubmit={form.handleSubmit(form.onSubmit)} className="space-y-4">
      <PropertyBasicFields
        control={form.control}
        errors={form.errors}
        loading={form.loading}
        nameValue={form.nameValue}
        descriptionValue={form.descriptionValue}
        categories={categories}
      />
      <PropertyLocationFields
        control={form.control}
        errors={form.errors}
        loading={form.loading}
        addressValue={form.addressValue}
        selectedProvinceId={form.selectedProvinceId}
        setSelectedProvinceId={form.setSelectedProvinceId}
        selectedGeo={form.selectedGeo}
        setSelectedGeo={form.setSelectedGeo}
        setValue={form.setValue}
        searchQuery={form.searchQuery}
        setSearchQuery={form.setSearchQuery}
        suggestions={form.suggestions}
        isSearching={form.isSearching}
        showSuggestions={form.showSuggestions}
        setShowSuggestions={form.setShowSuggestions}
        onSuggestionSelect={form.handleSuggestionSelect}
        onMarkerDrag={form.handleMarkerDrag}
      />
      <PropertyImageUpload
        existingImages={initialData?.images || []}
        files={form.files}
        setFiles={form.setFiles}
        deletedImages={form.deletedImages}
        setDeletedImages={form.setDeletedImages}
        mainImageId={form.mainImageId}
        setMainImageId={form.setMainImageId}
        mainImageIndex={form.mainImageIndex}
        setMainImageIndex={form.setMainImageIndex}
        loading={form.loading}
      />
      <div className="flex justify-end space-x-2 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={form.loading}>
            Batal
          </Button>
        )}
        <Button type="submit" disabled={form.loading}>
          {form.loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
