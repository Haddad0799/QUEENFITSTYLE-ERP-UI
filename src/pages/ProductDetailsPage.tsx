import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { DEFAULT_PAGE_SIZE } from '../config';
import { ProductStatusSection } from '../components/ProductStatusSection';
import type {
  ProductDetailsDTO,
  ProductStatus,
  SkuStatus,
  SkuSummaryDTO,
} from '../types/products';
import type {
  ColorsAdminDetailsDTO,
  ColorAdminDetailsDTO,
  SizesAdminDetailsDTO,
  SizeAdminDetailsDTO,
  SkuDetailsDTO,
  PresignedUrlDTO,
  UpdateSkuDimensionsDTO,
  ProductColorImagesDTO,
} from '../types/catalog-aux';
import type { Category, CategoriesDetailsDTO } from '../types/categories';

const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  DRAFT: 'Rascunho',
  READY_FOR_SALE: 'Pronto para venda',
  PUBLISHED: 'Publicado',
  INACTIVE: 'Inativo',
  ARCHIVED: 'Arquivado',
};

const SKU_STATUS_LABEL: Record<SkuStatus, string> = {
  INCOMPLETE: 'Incompleto',
  READY: 'Pronto',
  PUBLISHED: 'Publicado',
  BLOCKED: 'Bloqueado',
  DISCONTINUED: 'Descontinuado',
};

const SKU_STATUS_BADGE: Record<SkuStatus, string> = {
  INCOMPLETE: 'bg-amber-50 text-amber-700 border-amber-200 dark:border-amber-400/60 dark:bg-amber-500/10 dark:text-amber-200',
  READY: 'bg-green-50 text-green-700 border-green-200 dark:border-emerald-400/70 dark:bg-emerald-500/15 dark:text-emerald-100',
  PUBLISHED:
    'bg-green-100 text-green-800 border-green-300 dark:border-emerald-400/90 dark:bg-emerald-500/20 dark:text-emerald-50',
  BLOCKED: 'bg-red-50 text-red-700 border-red-200 dark:border-rose-400/70 dark:bg-rose-500/10 dark:text-rose-200',
  DISCONTINUED: 'bg-gray-100 text-gray-500 border-gray-200 dark:border-gray-600 dark:bg-gray-900/80 dark:text-gray-400',
};

export function ProductDetailsPage() {
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
    const [publishError, setPublishError] = useState<string | null>(null);
    // Função para publicar produto
    const handlePublishProduct = async () => {
      if (!productId) return;
      setIsPublishing(true);
      setPublishSuccess(null);
      setPublishError(null);
      try {
        await apiClient.post(`/erp/products/${productId}/publish`);
        setPublishSuccess('Produto publicado com sucesso!');
        // Atualiza dados do produto após publicação
        const refreshed = await apiClient.get<ProductDetailsDTO>(`/erp/products/${productId}`);
        setData(refreshed);
        if (refreshed.status !== 'PUBLISHED') setPublishSuccess(null);
      } catch (err) {
        setPublishError(
          err instanceof Error ? err.message : 'Erro ao publicar produto.'
        );
      } finally {
        setIsPublishing(false);
      }
    };
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProductDetailsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreateSku, setShowCreateSku] = useState(false);
  const [colors, setColors] = useState<ColorAdminDetailsDTO[]>([]);
  const [sizes, setSizes] = useState<SizeAdminDetailsDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', categoryId: 0 });
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [editProductError, setEditProductError] = useState<string | null>(null);
  const [skuFormError, setSkuFormError] = useState<string | null>(null);
  const [isSavingSkus, setIsSavingSkus] = useState(false);

  const [skuRows, setSkuRows] = useState([
    {
      code: '',
      colorId: '',
      sizeId: '',
      width: '',
      height: '',
      length: '',
      weight: '',
      stockQuantity: '',
      costPrice: '',
      sellingPrice: '',
      codeManuallyEdited: false,
    },
  ]);

  const [selectedSkuId, setSelectedSkuId] = useState<number | null>(null);
  const [selectedSku, setSelectedSku] = useState<SkuDetailsDTO | null>(null);
  const [isLoadingSkuDetails, setIsLoadingSkuDetails] = useState(false);
  const [skuDetailsError, setSkuDetailsError] = useState<string | null>(null);

  // SKU list and filters
  const [skuFilters, setSkuFilters] = useState<{
    status?: SkuStatus | '';
    colorId?: number | '';
    sizeId?: number | '';
  }>({});
  const [skusItems, setSkusItems] = useState<SkuSummaryDTO[]>([]);
  const [isLoadingSkus, setIsLoadingSkus] = useState(false);
  const [skuPage, setSkuPage] = useState(0);
  const [skuTotalPages, setSkuTotalPages] = useState(0);
  const [skuTotalElements, setSkuTotalElements] = useState(0);

  const [selectedColorIdForImages, setSelectedColorIdForImages] = useState<
    number | ''
  >('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewsRef = useRef<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [uploadedImageKeys, setUploadedImageKeys] = useState<string[]>([]);
  const [presignedUrls, setPresignedUrls] = useState<PresignedUrlDTO[]>([]);
  const [isLoadingPresignedUrls, setIsLoadingPresignedUrls] = useState(false);
  const [imageStartOrder, setImageStartOrder] = useState(1);

  // image deletion selection
  const [selectedImageIds, setSelectedImageIds] = useState<Set<number>>(new Set());
  const [isDeletingImages, setIsDeletingImages] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const skuImagesChangedRef = useRef(false);

  // upload preview drag state
  const [uploadDragFrom, setUploadDragFrom] = useState<number | null>(null);
  const [uploadDragOver, setUploadDragOver] = useState<number | null>(null);

  // gallery reorder (product images by color)
  const [galleryReorder, setGalleryReorder] = useState<Record<string, import('../types/catalog-aux').ProductImageDTO[]>>({});
  const [galleryDirty, setGalleryDirty] = useState<Set<string>>(new Set());
  const [gallerySaving, setGallerySaving] = useState<string | null>(null);
  const [galleryReorderError, setGalleryReorderError] = useState<string | null>(null);
  const [galleryDragColor, setGalleryDragColor] = useState<string | null>(null);
  const [galleryDragFrom, setGalleryDragFrom] = useState<number | null>(null);
  const [galleryDragOver, setGalleryDragOver] = useState<number | null>(null);

  // image lightbox
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);
  const openLightbox = (urls: string[], index: number) => setLightbox({ urls, index });
  const closeLightbox = () => setLightbox(null);

  // primary image picker
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [productImages, setProductImages] = useState<ProductColorImagesDTO[]>([]);
  const [isLoadingProductImages, setIsLoadingProductImages] = useState(false);
  const [isSavingPrimary, setIsSavingPrimary] = useState(false);
  const [primaryPickerError, setPrimaryPickerError] = useState<string | null>(null);

  // stock adjustment
  const [isEditingStock, setIsEditingStock] = useState(false);
  const [stockForm, setStockForm] = useState({ quantity: '', reason: '' });
  const [isSavingStock, setIsSavingStock] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  // price editing
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceForm, setPriceForm] = useState({ costPrice: '', sellingPrice: '' });
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  // dimensions editing
  const [isEditingDimensions, setIsEditingDimensions] = useState(false);
  const [dimensionsForm, setDimensionsForm] = useState({ width: '', height: '', length: '', weight: '' });
  const [isSavingDimensions, setIsSavingDimensions] = useState(false);
  const [dimensionsError, setDimensionsError] = useState<string | null>(null);

  const productId = Number(id);

  const loadProductImages = async (): Promise<ProductColorImagesDTO[] | undefined> => {
    if (!productId) return;
    setIsLoadingProductImages(true);
    setPrimaryPickerError(null);
    try {
      const res = await apiClient.get<ProductColorImagesDTO[]>(
        `/erp/products/${productId}/images`,
      );
      setProductImages(res);
      return res;
    } catch (err) {
      setPrimaryPickerError(
        err instanceof Error ? err.message : 'Erro ao carregar imagens.',
      );
    } finally {
      setIsLoadingProductImages(false);
    }
  };

  const handleOpenPrimaryPicker = () => {
    setShowPrimaryPicker(true);
    loadProductImages();
  };

  const handleSetPrimaryImage = async (imageId: number) => {
    if (!productId) return;
    setIsSavingPrimary(true);
    setPrimaryPickerError(null);
    try {
      await apiClient.patch(`/erp/products/${productId}/primary-image`, {
        imageId,
      });
      const refreshed = await apiClient.get<ProductDetailsDTO>(
        `/erp/products/${productId}`,
      );
      setData(refreshed);
      if (refreshed.status !== 'PUBLISHED') setPublishSuccess(null);
      setShowPrimaryPicker(false);
    } catch (err) {
      setPrimaryPickerError(
        err instanceof Error ? err.message : 'Erro ao definir imagem principal.',
      );
    } finally {
      setIsSavingPrimary(false);
    }
  };

  useEffect(() => {
    if (!productId) return;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<ProductDetailsDTO>(
          `/erp/products/${productId}`,
        );
        setData(response);
        // initialize skusItems with product's skus
        setSkusItems(response.skus ?? []);
        if (response.status !== 'PUBLISHED') setPublishSuccess(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar o produto.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
    loadProductImages();
  }, [productId]);

  const fetchSkus = async () => {
    if (!productId) return;
    setIsLoadingSkus(true);
    try {
      const res = await apiClient.get<{
        items: SkuSummaryDTO[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
      }>(`/erp/products/${productId}/skus`, {
        status: skuFilters.status || undefined,
        colorId: skuFilters.colorId || undefined,
        sizeId: skuFilters.sizeId || undefined,
        page: skuPage,
        size: DEFAULT_PAGE_SIZE,
      });
      setSkusItems(res.items ?? []);
      setSkuTotalPages(res.totalPages ?? 0);
      setSkuTotalElements(res.totalElements ?? 0);
    } catch (err) {
      // keep previous list and show no blocking error here
    } finally {
      setIsLoadingSkus(false);
    }
  };

  useEffect(() => {
    // refetch skus when filters change
    fetchSkus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skuFilters, data, skuPage]);

  // carregar cores e tamanhos auxiliares quando abrir tela
  useEffect(() => {
    const loadAux = async () => {
      try {
        const [colorsRes, sizesRes, categoriesRes] = await Promise.all([
          apiClient.get<ColorsAdminDetailsDTO>('/erp/colors'),
          apiClient.get<SizesAdminDetailsDTO>('/erp/sizes'),
          apiClient.get<CategoriesDetailsDTO>('/erp/categories'),
        ]);
        setColors(colorsRes.coresDispoiveis ?? []);
        setSizes(sizesRes.tamanhosDisponiveis ?? []);
        setCategories(categoriesRes.categorias ?? []);
      } catch {
        // se falhar, usuário ainda consegue ver o produto
      }
    };

    loadAux();
  }, []);

  const handleOpenEditProduct = () => {
    if (!data) return;
    setEditForm({ name: data.name, description: data.description ?? '', categoryId: data.categoryId });
    setEditProductError(null);
    setShowEditProduct(true);
  };

  const handleSaveProduct = async () => {
    if (!id) return;
    setIsSavingProduct(true);
    setEditProductError(null);
    try {
      await apiClient.patch(`/erp/products/${id}`, {
        name: editForm.name,
        description: editForm.description,
        categoryId: editForm.categoryId,
      });
      const refreshed = await apiClient.get<ProductDetailsDTO>(`/erp/products/${id}`);
      setData(refreshed);
      if (refreshed.status !== 'PUBLISHED') setPublishSuccess(null);
      setShowEditProduct(false);
    } catch (err: unknown) {
      setEditProductError(
        err instanceof Error ? err.message : 'Erro ao salvar produto.',
      );
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleOpenCreateSku = () => {
    setSkuFormError(null);
    setShowCreateSku(true);
  };

  const handleCloseCreateSku = () => {
    setShowCreateSku(false);
    setSkuFormError(null);
    setSkuRows([
      {
        code: '',
        colorId: '',
        sizeId: '',
        width: '',
        height: '',
        length: '',
        weight: '',
        stockQuantity: '',
        costPrice: '',
        sellingPrice: '',
        codeManuallyEdited: false,
      },
    ]);
  };

  const removeAccents = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const generateSkuCode = (colorId: string, sizeId: string) => {
    if (!data?.slug) return '';
    const colorName = colors.find((c) => c.id === Number(colorId))?.nome ?? '';
    const sizeLabel = sizes.find((s) => s.id === Number(sizeId))?.etiqueta ?? '';
    const parts = [data.slug, colorName, sizeLabel].filter(Boolean);
    return removeAccents(parts.join('-')).toUpperCase().replace(/\s+/g, '-');
  };

  const handleSkuRowChange = (
    index: number,
    field: keyof (typeof skuRows)[number],
    value: string,
  ) => {
    setSkuRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const updated = { ...row, [field]: value };
        if (field === 'code') {
          updated.codeManuallyEdited = true;
        }
        if (
          (field === 'colorId' || field === 'sizeId') &&
          !updated.codeManuallyEdited
        ) {
          updated.code = generateSkuCode(
            field === 'colorId' ? value : row.colorId,
            field === 'sizeId' ? value : row.sizeId,
          );
        }
        return updated;
      }),
    );
  };

  const handleRestoreSkuCode = (index: number) => {
    setSkuRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        return {
          ...row,
          code: generateSkuCode(row.colorId, row.sizeId),
          codeManuallyEdited: false,
        };
      }),
    );
  };

  const handleAddSkuRow = () => {
    setSkuRows((prev) => [
      ...prev,
      {
        code: '',
        colorId: '',
        sizeId: '',
        width: '',
        height: '',
        length: '',
        weight: '',
        stockQuantity: '',
        costPrice: '',
        sellingPrice: '',
        codeManuallyEdited: false,
      },
    ]);
  };

  const handleRemoveSkuRow = (index: number) => {
    setSkuRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSkus = async () => {
    if (!productId) return;

    const SKU_CODE_REGEX = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;

    const cleanedRows = skuRows
      .filter((row) => row.colorId && row.sizeId && row.code.trim().length > 0)
      .map((row) => ({
        code: row.code.trim().toUpperCase(),
        colorId: Number(row.colorId),
        sizeId: Number(row.sizeId),
        width: Number(row.width || 0),
        height: Number(row.height || 0),
        length: Number(row.length || 0),
        weight: Number(row.weight || 0),
        stockQuantity: Number(row.stockQuantity || 0),
        costPrice: Number(row.costPrice || 0),
        sellingPrice: Number(row.sellingPrice || 0),
      }));

    if (cleanedRows.length === 0) {
      setSkuFormError(
        'Preencha pelo menos uma linha com SKU, cor e tamanho.',
      );
      return;
    }

    const invalidCode = cleanedRows.find(
      (row) =>
        row.code.length < 3 ||
        row.code.length > 50 ||
        !SKU_CODE_REGEX.test(row.code),
    );

    if (invalidCode) {
      setSkuFormError(
        'Código SKU inválido. Use apenas letras e números em maiúsculo, separados por hífen (ex.: CAMISETA-DRYFIT-AZUL-P), entre 3 e 50 caracteres.',
      );
      return;
    }

    setIsSavingSkus(true);
    setSkuFormError(null);

    try {
      await apiClient.post(`/erp/products/${productId}/skus`, {
        skus: cleanedRows,
      });

      // recarregar produto para refletir SKUs
      const refreshed = await apiClient.get<ProductDetailsDTO>(
        `/erp/products/${productId}`,
      );
      setData(refreshed);
      if (refreshed.status !== 'PUBLISHED') setPublishSuccess(null);
      handleCloseCreateSku();
    } catch (err) {
      setSkuFormError(
        err instanceof Error
          ? err.message
          : 'Erro ao salvar SKUs. Tente novamente.',
      );
    } finally {
      setIsSavingSkus(false);
    }
  };

  const handleSelectSku = async (skuId: number) => {
    if (!productId) return;

    setSelectedSkuId(skuId);
    setSelectedSku(null);
    setSkuDetailsError(null);
    setSelectedImageIds(new Set());
    setIsLoadingSkuDetails(true);

    try {
      const details = await apiClient.get<SkuDetailsDTO>(
        `/erp/products/${productId}/skus/${skuId}`,
      );
      setSelectedSku(details);
    } catch (err) {
      setSkuDetailsError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar detalhes do SKU.',
      );
    } finally {
      setIsLoadingSkuDetails(false);
    }
  };

  const handleCloseSkuDetails = () => {
    const shouldRefetch = skuImagesChangedRef.current;
    setSelectedSkuId(null);
    setSelectedSku(null);
    setSkuDetailsError(null);
    setSelectedImageIds(new Set());
    setIsEditingDimensions(false);
    setDimensionsError(null);
    setIsEditingStock(false);
    setStockError(null);
    if (shouldRefetch) {
      // limpar campos de upload de imagem
      setImageFiles([]);
      setImagePreviews([]);
      previewsRef.current.forEach((p) => URL.revokeObjectURL(p));
      previewsRef.current = [];
      setPresignedUrls([]);
      setUploadedImageKeys([]);
      setImagesError(null);
      setImageStartOrder(1);
      if (inputRef.current) {
        try { inputRef.current.value = ''; } catch {}
      }
      fetchSkus();
    }
    skuImagesChangedRef.current = false;
  };

  const handleOpenEditDimensions = () => {
    if (!selectedSku) return;
    setDimensionsForm({
      width: String(selectedSku.dimensions.width),
      height: String(selectedSku.dimensions.height),
      length: String(selectedSku.dimensions.length),
      weight: String(selectedSku.dimensions.weight),
    });
    setDimensionsError(null);
    setIsEditingDimensions(true);
  };

  const handleCancelEditDimensions = () => {
    setIsEditingDimensions(false);
    setDimensionsError(null);
  };

  const handleSaveDimensions = async () => {
    if (!productId || !selectedSku) return;
    setIsSavingDimensions(true);
    setDimensionsError(null);

    const body: UpdateSkuDimensionsDTO = {};
    const w = parseFloat(dimensionsForm.width);
    const h = parseFloat(dimensionsForm.height);
    const l = parseFloat(dimensionsForm.length);
    const wt = parseFloat(dimensionsForm.weight);

    if (!isNaN(w)) body.width = w;
    if (!isNaN(h)) body.height = h;
    if (!isNaN(l)) body.length = l;
    if (!isNaN(wt)) body.weight = wt;

    if (Object.keys(body).length === 0) {
      setDimensionsError('Preencha ao menos um campo.');
      setIsSavingDimensions(false);
      return;
    }

    try {
      await apiClient.patch(
        `/erp/products/${productId}/skus/${selectedSku.id}/dimensions`,
        body,
      );
      // refresh sku details
      const refreshed = await apiClient.get<SkuDetailsDTO>(
        `/erp/products/${productId}/skus/${selectedSku.id}`,
      );
      setSelectedSku(refreshed);
      setIsEditingDimensions(false);
    } catch (err) {
      setDimensionsError(
        err instanceof Error ? err.message : 'Erro ao salvar dimensões.',
      );
    } finally {
      setIsSavingDimensions(false);
    }
  };

  const handleOpenEditStock = () => {
    setStockForm({ quantity: '', reason: '' });
    setStockError(null);
    setIsEditingStock(true);
  };

  const handleCancelEditStock = () => {
    setIsEditingStock(false);
    setStockError(null);
  };

  const handleSaveStock = async () => {
    if (!productId || !selectedSku) return;

    const qty = parseInt(stockForm.quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setStockError('Informe uma quantidade válida (≥ 0).');
      return;
    }
    if (!stockForm.reason.trim()) {
      setStockError('Informe o motivo do ajuste.');
      return;
    }

    setIsSavingStock(true);
    setStockError(null);

    try {
      await apiClient.post(
        `/erp/products/${productId}/skus/${selectedSku.id}/stock/movements`,
        {
          type: 'ADJUSTMENT',
          quantity: qty,
          reason: stockForm.reason.trim(),
        },
      );
      const refreshed = await apiClient.get<SkuDetailsDTO>(
        `/erp/products/${productId}/skus/${selectedSku.id}`,
      );
      setSelectedSku(refreshed);
      setIsEditingStock(false);
    } catch (err) {
      setStockError(
        err instanceof Error ? err.message : 'Erro ao ajustar estoque.',
      );
    } finally {
      setIsSavingStock(false);
    }
  };

  const handleOpenEditPrice = () => {
    if (!selectedSku) return;
    setPriceForm({
      costPrice: String(selectedSku.price.costPrice),
      sellingPrice: String(selectedSku.price.sellingPrice),
    });
    setPriceError(null);
    setIsEditingPrice(true);
  };

  const handleCancelEditPrice = () => {
    setIsEditingPrice(false);
    setPriceError(null);
  };

  const handleSavePrice = async () => {
    if (!productId || !selectedSku) return;

    const cost = parseFloat(priceForm.costPrice);
    const selling = parseFloat(priceForm.sellingPrice);

    if (isNaN(cost) || cost < 0) {
      setPriceError('Informe um preço de custo válido.');
      return;
    }
    if (isNaN(selling) || selling < 0) {
      setPriceError('Informe um preço de venda válido.');
      return;
    }

    setIsSavingPrice(true);
    setPriceError(null);

    try {
      await apiClient.put(
        `/erp/products/${productId}/skus/${selectedSku.id}/price`,
        { costPrice: cost, sellingPrice: selling },
      );
      const refreshed = await apiClient.get<SkuDetailsDTO>(
        `/erp/products/${productId}/skus/${selectedSku.id}`,
      );
      setSelectedSku(refreshed);
      setIsEditingPrice(false);
    } catch (err) {
      setPriceError(
        err instanceof Error ? err.message : 'Erro ao salvar preços.',
      );
    } finally {
      setIsSavingPrice(false);
    }
  };

  const toggleImageSelection = (imgId: number) => {
    setSelectedImageIds((prev) => {
      const next = new Set(prev);
      if (next.has(imgId)) next.delete(imgId);
      else next.add(imgId);
      return next;
    });
  };

  // gallery reorder drag handlers
  const getGalleryImages = (colorName: string) =>
    galleryReorder[colorName] ?? productImages.find((g) => g.colorName === colorName)?.images ?? [];

  const handleGalleryDragStart = (e: React.DragEvent, colorName: string, idx: number) => {
    setGalleryDragColor(colorName);
    setGalleryDragFrom(idx);
    setGalleryDragOver(idx);
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(idx));
    } catch {}
  };

  const handleGalleryDragOver = (e: React.DragEvent, colorName: string, idx: number) => {
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch {}
    if (galleryDragColor !== colorName || galleryDragFrom === null || idx === galleryDragFrom) return;
    const imgs = [...getGalleryImages(colorName)];
    [imgs[galleryDragFrom], imgs[idx]] = [imgs[idx], imgs[galleryDragFrom]];
    setGalleryReorder((prev) => ({ ...prev, [colorName]: imgs }));
    setGalleryDirty((prev) => new Set(prev).add(colorName));
    setGalleryDragFrom(idx);
    setGalleryDragOver(idx);
  };

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setGalleryDragFrom(null);
    setGalleryDragOver(null);
    setGalleryDragColor(null);
  };

  const handleGalleryDragEnd = () => {
    setGalleryDragFrom(null);
    setGalleryDragOver(null);
    setGalleryDragColor(null);
  };

  const handleGalleryUndoReorder = (colorName: string) => {
    setGalleryReorder((prev) => {
      const next = { ...prev };
      delete next[colorName];
      return next;
    });
    setGalleryDirty((prev) => {
      const next = new Set(prev);
      next.delete(colorName);
      return next;
    });
    setGalleryReorderError(null);
  };

  const handleGallerySaveReorder = async (colorName: string) => {
    if (!productId) return;
    const colorId = colors.find((c) => c.nome === colorName)?.id;
    if (!colorId) return;
    const imgs = getGalleryImages(colorName);
    setGallerySaving(colorName);
    setGalleryReorderError(null);
    try {
      await apiClient.put(
        `/erp/products/${productId}/colors/${colorId}/images/reorder`,
        { orderedImageIds: imgs.map((img) => img.id) },
      );
      await loadProductImages();
      handleGalleryUndoReorder(colorName);
    } catch (err) {
      setGalleryReorderError(
        err instanceof Error ? err.message : 'Erro ao reordenar imagens.',
      );
    } finally {
      setGallerySaving(null);
    }
  };

  const handleDeleteSelectedImages = async () => {
    if (!productId || selectedImageIds.size === 0) return;
    setShowDeleteConfirm(false);

    const colorNameToId = new Map<string, number>();
    for (const c of colors) {
      colorNameToId.set(c.nome, c.id);
    }

    const colorImageMap = new Map<number, number[]>();
    for (const group of productImages) {
      const colorId = colorNameToId.get(group.colorName);
      if (!colorId) continue;
      for (const img of group.images) {
        if (selectedImageIds.has(img.id)) {
          const existing = colorImageMap.get(colorId) ?? [];
          existing.push(img.id);
          colorImageMap.set(colorId, existing);
        }
      }
    }

    setIsDeletingImages(true);
    try {
      for (const [colorId, ids] of colorImageMap) {
        await apiClient.delete(
          `/erp/products/${productId}/colors/${colorId}/images`,
          { imageIds: ids },
        );
      }
      setSelectedImageIds(new Set());
      const freshImages = await loadProductImages();
      const refreshed = await apiClient.get<ProductDetailsDTO>(
        `/erp/products/${productId}`,
      );
      setData(refreshed);
      if (refreshed.status !== 'PUBLISHED') setPublishSuccess(null);

      // Recalculate imageStartOrder for the currently selected color
      if (selectedColorIdForImages && freshImages) {
        const cName = colors.find((c) => c.id === Number(selectedColorIdForImages))?.nome;
        const group = freshImages.find((g) => g.colorName === cName);
        const remaining = group?.images.length ?? 0;
        setImageStartOrder(Math.min(remaining + 1, 5));
      }

      // Clear pending upload files since image context changed
      setImageFiles([]);
      setImagePreviews([]);
      previewsRef.current.forEach((p) => URL.revokeObjectURL(p));
      previewsRef.current = [];
      setPresignedUrls([]);
      setUploadedImageKeys([]);
      if (inputRef.current) {
        try { inputRef.current.value = ''; } catch {}
      }
    } catch (err) {
      setPrimaryPickerError(
        err instanceof Error ? err.message : 'Erro ao excluir imagens.',
      );
    } finally {
      setIsDeletingImages(false);
    }
  };

  const selectedSkuStatusLabel = useMemo(() => {
    if (!selectedSku) return '';
    const status =
      (selectedSku.status as SkuStatus) ?? ('INCOMPLETE' as SkuStatus);
    return SKU_STATUS_LABEL[status];
  }, [selectedSku]);

  const productColorsForImages = useMemo(() => {
    if (!data) return [];
    const namesInProduct = Array.from(
      new Set(data.skus.map((s) => s.colorName)),
    );
    return colors.filter((c) => namesInProduct.includes(c.nome));
  }, [colors, data]);

  const productSizesForFilters = useMemo(() => {
    if (!data) return [];
    const namesInProduct = Array.from(
      new Set(data.skus.map((s) => s.sizeName)),
    );
    return sizes.filter((s) => namesInProduct.includes(s.etiqueta));
  }, [sizes, data]);

  const existingImagesForSelectedColor = useMemo(() => {
    if (!selectedColorIdForImages) return 0;
    const colorName = colors.find((c) => c.id === Number(selectedColorIdForImages))?.nome;
    if (!colorName) return 0;
    const group = productImages.find((g) => g.colorName === colorName);
    return group?.images.length ?? 0;
  }, [selectedColorIdForImages, colors, productImages]);

  const maxNewFiles = 5 - existingImagesForSelectedColor;

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []);
    if (incoming.length === 0) return;

    // start from existing files/previews and append up to remaining slots
    const currentFiles = [...imageFiles];
    const currentPreviews = [...imagePreviews];

    for (const f of incoming) {
      if (currentFiles.length >= maxNewFiles) break;
      currentFiles.push(f);
      const url = URL.createObjectURL(f);
      currentPreviews.push(url);
      previewsRef.current.push(url);
    }

    setImageFiles(currentFiles);
    setImagePreviews(currentPreviews);
    // any change invalidates previously-fetched presigned URLs
    setPresignedUrls([]);
    setUploadedImageKeys([]);
    setImagesError(null);
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const toRevoke = imagePreviews[index];
    if (toRevoke) URL.revokeObjectURL(toRevoke);
    previewsRef.current = newPreviews;
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    // ensure presigned urls (if any) are cleared so removed ones aren't uploaded
    setPresignedUrls([]);
    // if no files left, clear the file input so user can reselect
    if (newFiles.length === 0 && inputRef.current) {
      try {
        inputRef.current.value = '';
      } catch {}
    }
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setUploadDragFrom(idx);
    setUploadDragOver(idx);
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(idx));
    } catch {}
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch {}
    if (uploadDragFrom === null || idx === uploadDragFrom) return;
    // swap on hover
    setImageFiles((prev) => {
      const arr = [...prev];
      [arr[uploadDragFrom!], arr[idx]] = [arr[idx], arr[uploadDragFrom!]];
      return arr;
    });
    setImagePreviews((prev) => {
      const arr = [...prev];
      [arr[uploadDragFrom!], arr[idx]] = [arr[idx], arr[uploadDragFrom!]];
      return arr;
    });
    setPresignedUrls([]);
    setUploadDragFrom(idx);
    setUploadDragOver(idx);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadDragFrom(null);
    setUploadDragOver(null);
  };

  const handleDragEnd = () => {
    setUploadDragFrom(null);
    setUploadDragOver(null);
  };

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((p) => URL.revokeObjectURL(p));
    };
  }, []);
  const handleConfirmAndUploadImages = async () => {
    if (!productId || !selectedColorIdForImages || imageFiles.length === 0) {
      if (!selectedColorIdForImages) {
        setImagesError('Selecione uma cor antes de confirmar o envio.');
      } else {
        setImagesError('Selecione pelo menos um arquivo de imagem.');
      }
      return;
    }

    const maxOrder = imageStartOrder + imageFiles.length - 1;
    if (imageStartOrder < 1 || maxOrder > 5) {
      setImagesError(`A ordem de exibição deve ficar entre 1 e 5. Com ${imageFiles.length} arquivo(s) a partir da ordem ${imageStartOrder}, a última seria ${maxOrder}.`);
      return;
    }

    setIsUploadingImages(true);
    setImagesError(null);
    setUploadedImageKeys([]);
    setPresignedUrls([]);

    try {
      // 1. Obter URLs pré-assinadas (para ter as imageKeys)
      setIsLoadingPresignedUrls(true);
      const filenames = imageFiles.map((f) => f.name);

      const urls = await apiClient.post<PresignedUrlDTO[]>(
        `/erp/products/${productId}/colors/${selectedColorIdForImages}/images/upload-urls`,
        { files: filenames },
      );

      const presigned: PresignedUrlDTO[] = urls ?? [];
      setPresignedUrls(presigned);
      setIsLoadingPresignedUrls(false);

      const imageKeys = presigned.map((p, index) => ({
        imageKey: p.imageKey,
        order: imageStartOrder + index,
      }));

      // 2. Registrar imagens no backend ANTES de enviar ao bucket
      //    Isso valida a ordem e evita upload desnecessário se houver erro
      await apiClient.post(
        `/erp/products/${productId}/colors/${selectedColorIdForImages}/images`,
        {
          images: imageKeys,
        },
      );

      // 3. Só depois de registrar com sucesso, enviar ao bucket
      await Promise.all(
        presigned.map((item, index) => {
          const file = imageFiles[index];
          if (!file) return Promise.resolve();
          return fetch(item.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
          }).then((res) => {
            if (!res.ok) {
              throw new Error('Falha ao enviar uma das imagens.');
            }
          });
        }),
      );

      setUploadedImageKeys(imageKeys.map((i) => i.imageKey));
      // Avançar a ordem inicial para o próximo upload (limitado a 5)
      setImageStartOrder(Math.min(5, imageStartOrder + imageFiles.length));
      setImageFiles([]);
      setImagePreviews([]);
      previewsRef.current.forEach((p) => URL.revokeObjectURL(p));
      previewsRef.current = [];
      setPresignedUrls([]);
      if (inputRef.current) {
        try {
          inputRef.current.value = '';
        } catch {}
      }
      // recarregar SKUs, imagens e dados do produto
      await loadProductImages();
      fetchSkus();
      const refreshed = await apiClient.get<ProductDetailsDTO>(
        `/erp/products/${productId}`,
      );
      setData(refreshed);
    } catch (err) {
      setImagesError(
        err instanceof Error
          ? err.message
          : 'Erro ao fazer upload das imagens. Tente novamente.',
      );
      // Limpar presigned URLs para voltar ao estado de preview e permitir reenvio
      setPresignedUrls([]);
    } finally {
      setIsUploadingImages(false);
      setIsLoadingPresignedUrls(false);
    }
  };

  const handleBack = () => {
    navigate('/products');
  };

  if (!id || Number.isNaN(productId)) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-danger">
        ID de produto inválido.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-2.5 text-xs font-medium text-body hover:border-edge-strong hover:text-heading"
          >
            ← Voltar
          </button>
          <div>
            <h1 className="text-xl font-semibold text-heading">
              {data ? data.name : 'Carregando produto...'}
            </h1>
            {data && (
              <p className="text-[11px] text-muted">
                ID #{data.id} • {data.categoryName}
              </p>
            )}
          </div>
        </div>

        {data && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-edge bg-surface px-2.5 py-1 text-[11px] text-label">
              Slug:{' '}
              <code className="text-[10px] text-heading">{data.slug}</code>
            </span>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="rounded-xl border border-edge bg-surface p-6 text-sm text-label">
          Carregando detalhes do produto...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-danger-edge bg-danger-soft p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          <div className="flex items-center gap-4 rounded-xl border border-edge bg-surface p-4">
            {data.mainImageUrl ? (
              <img
                src={data.mainImageUrl}
                alt={data.name}
                onClick={() => openLightbox([data.mainImageUrl!], 0)}
                className="h-40 w-40 flex-shrink-0 cursor-pointer rounded-lg border border-edge object-cover transition hover:opacity-80"
              />
            ) : (
              <div className="flex h-40 w-40 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-edge bg-surface-alt text-xs text-faint">
                Sem imagem principal
              </div>
            )}
            <div className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Imagem principal
              </h2>
              <p className="text-[11px] text-faint">
                {data.mainImageUrl
                  ? 'Essa imagem é exibida como capa do produto.'
                  : 'Nenhuma imagem definida. Escolha uma das imagens dos SKUs.'}
              </p>
              <button
                onClick={handleOpenPrimaryPicker}
                className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg border border-edge-strong bg-surface-alt px-3 py-1.5 text-[11px] font-medium text-label transition hover:text-heading"
              >
                {data.mainImageUrl ? 'Alterar imagem' : 'Escolher imagem'}
              </button>
            </div>
          </div>

          {showPrimaryPicker && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-edge bg-surface p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-heading">
                    Escolher imagem principal
                  </h3>
                  <button
                    onClick={() => setShowPrimaryPicker(false)}
                    className="text-xs text-muted hover:text-heading"
                  >
                    ✕
                  </button>
                </div>

                {primaryPickerError && (
                  <div className="mb-3 rounded-lg border border-danger-edge bg-danger-soft p-2 text-xs text-danger">
                    {primaryPickerError}
                  </div>
                )}

                {isLoadingProductImages && (
                  <p className="py-6 text-center text-xs text-muted">
                    Carregando imagens...
                  </p>
                )}

                {!isLoadingProductImages && productImages.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted">
                    Nenhuma imagem cadastrada nos SKUs deste produto.
                  </p>
                )}

                {!isLoadingProductImages &&
                  productImages.map((group) => (
                    <div key={group.colorName} className="mb-4">
                      <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                        <span
                          className="inline-block h-3 w-3 rounded-full border border-edge-strong"
                          style={{ backgroundColor: group.hexCode }}
                        />
                        {group.colorName}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {group.images.map((img) => (
                          <div key={img.id} className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 border-edge transition hover:border-brand">
                            <img
                              src={img.url}
                              alt={`${group.colorName} #${img.order}`}
                              onClick={() => openLightbox(group.images.map((i) => i.url), group.images.indexOf(img))}
                              className="h-full w-full cursor-pointer object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-between bg-black/0 transition group-hover:bg-black/40">
                              <button
                                disabled={isSavingPrimary}
                                onClick={() => handleSetPrimaryImage(img.id)}
                                className="m-auto rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-gray-800 opacity-0 shadow transition hover:bg-white group-hover:opacity-100 disabled:opacity-50"
                              >
                                Selecionar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                {isSavingPrimary && (
                  <p className="mt-2 text-center text-[11px] text-muted">
                    Salvando...
                  </p>
                )}
              </div>
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
            <div className="rounded-xl border border-edge bg-surface p-4 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Informações gerais
                </h2>
                <button
                  onClick={handleOpenEditProduct}
                  className="rounded-lg border border-edge-strong bg-surface-alt px-3 py-1.5 text-[11px] font-medium text-label transition hover:bg-surface-alt hover:text-heading"
                >
                  Editar
                </button>
              </div>
              <p className="mb-3 text-sm text-body">{data.description}</p>
              <p className="text-xs text-muted">
                Categoria:{' '}
                <span className="font-medium text-heading">
                  {data.categoryName}
                </span>
              </p>
            </div>

            <ProductStatusSection
              status={data.status}
              onPublish={handlePublishProduct}
              publishSuccess={!!publishSuccess}
              isPublishing={isPublishing}
              onDismissSuccess={() => setPublishSuccess(null)}
            />
          </section>

          <section className="rounded-xl border border-edge bg-surface p-4 text-xs">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    SKUs do produto
                  </h2>
                  <p className="text-[11px] text-faint">
                    {skusItems.length} variação(ões) exibida(s).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={skuFilters.status ?? ''}
                    onChange={(e) => {
                      setSkuFilters((prev) => ({ ...prev, status: e.target.value as SkuStatus | '' }));
                      setSkuPage(0);
                    }}
                    className="h-8 min-w-[140px] rounded-lg border border-edge-strong bg-surface-input px-2.5 text-xs text-heading outline-none"
                  >
                    <option value="">Todos os status</option>
                    {(
                      ['INCOMPLETE', 'READY', 'PUBLISHED', 'BLOCKED', 'DISCONTINUED'] as SkuStatus[]
                    ).map((s) => (
                      <option key={s} value={s}>
                        {SKU_STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    {skuFilters.colorId && (() => {
                      const sel = productColorsForImages.find((c) => c.id === Number(skuFilters.colorId));
                      return sel ? (
                        <span
                          className="inline-block h-4 w-4 rounded-full border border-edge-strong"
                          style={{ backgroundColor: sel.hexaCode }}
                        />
                      ) : null;
                    })()}
                    <select
                      value={skuFilters.colorId ?? ''}
                      onChange={(e) => {
                        setSkuFilters((prev) => ({ ...prev, colorId: e.target.value ? Number(e.target.value) : '' }));
                        setSkuPage(0);
                      }}
                      className="h-8 min-w-[140px] rounded-lg border border-edge-strong bg-surface-input px-2.5 text-xs text-heading outline-none"
                    >
                      <option value="">Todas as cores</option>
                      {productColorsForImages.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={skuFilters.sizeId ?? ''}
                    onChange={(e) => {
                      setSkuFilters((prev) => ({ ...prev, sizeId: e.target.value ? Number(e.target.value) : '' }));
                      setSkuPage(0);
                    }}
                    className="h-8 min-w-[120px] rounded-lg border border-edge-strong bg-surface-input px-2.5 text-xs text-heading outline-none"
                  >
                    <option value="">Todos os tamanhos</option>
                    {productSizesForFilters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateSku}
                className="inline-flex items-center gap-1 rounded-lg border border-edge-strong bg-surface px-2.5 py-1.5 text-[11px] font-medium text-heading hover:border-brand hover:text-brand"
              >
                Adicionar SKUs
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-edge bg-surface">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-edge bg-surface-alt text-[11px] uppercase tracking-[0.12em] text-muted">
                    <th className="px-3 py-2 text-left font-semibold">Cor</th>
                    <th className="px-3 py-2 text-left font-semibold">Tamanho</th>
                    <th className="px-3 py-2 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className={isLoadingSkus ? 'opacity-50 pointer-events-none' : ''}>
                  {(() => {
                    const items = skusItems;
                    const sorted = [...items].sort((a, b) => a.colorName.localeCompare(b.colorName));
                    let lastColor = '';
                    return sorted.map((sku: SkuSummaryDTO) => {
                      const showColorHeader = sku.colorName !== lastColor;
                      lastColor = sku.colorName;
                      return (
                        <tr
                          key={sku.id}
                          className={`cursor-pointer border-t hover:bg-surface-alt ${showColorHeader ? 'border-edge-strong' : 'border-edge'}`}
                          onClick={() => handleSelectSku(sku.id)}
                          title={sku.code}
                        >
                          <td className="px-3 py-2 align-middle text-[11px] text-body">
                            {showColorHeader && (
                              <span className="inline-flex items-center gap-1.5">
                                <span
                                  className="inline-block h-3 w-3 rounded-full border border-edge-strong"
                                  style={{ backgroundColor: colors.find((c) => c.nome === sku.colorName)?.hexaCode }}
                                />
                                {sku.colorName}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 align-middle text-[11px] font-medium text-heading">
                            {sku.sizeName}
                          </td>
                          <td className="px-3 py-2 align-middle">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${SKU_STATUS_BADGE[sku.status]}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                              {SKU_STATUS_LABEL[sku.status]}
                            </span>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
              <div>
                <span>
                  Página <span className="font-semibold text-heading">{skuTotalPages === 0 ? 0 : skuPage + 1}</span> de <span className="font-semibold text-heading">{skuTotalPages}</span>
                </span>
                <span className="ml-4">{skuTotalElements} resultado(s)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={skuPage <= 0}
                  onClick={() => setSkuPage((p) => Math.max(0, p - 1))}
                  className="inline-flex h-7 items-center rounded-lg border border-edge-strong bg-surface px-2 text-xs font-medium text-body disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  disabled={skuPage >= Math.max(0, skuTotalPages - 1)}
                  onClick={() => setSkuPage((p) => (skuTotalPages ? Math.min(skuTotalPages - 1, p + 1) : p))}
                  className="inline-flex h-7 items-center rounded-lg border border-edge-strong bg-surface px-2 text-xs font-medium text-body disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-edge bg-surface p-4 text-xs">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Imagens por cor
                </h2>
                <p className="text-[11px] text-faint">
                  SKUs da mesma cor compartilham o mesmo conjunto de imagens.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-label">
                  Cor do produto
                </label>
                <select
                  value={selectedColorIdForImages}
                  onChange={(e) => {
                    const newColorId = e.target.value ? Number(e.target.value) : '';
                    setSelectedColorIdForImages(newColorId);
                    setImageFiles([]);
                    setImagePreviews([]);
                    previewsRef.current.forEach((p) => URL.revokeObjectURL(p));
                    previewsRef.current = [];
                    setPresignedUrls([]);
                    setUploadedImageKeys([]);
                    setImagesError(null);
                    // auto-set start order based on existing images for this color
                    if (newColorId) {
                      const cName = colors.find((c) => c.id === Number(newColorId))?.nome;
                      const group = productImages.find((g) => g.colorName === cName);
                      const existingCount = group?.images.length ?? 0;
                      setImageStartOrder(Math.min(existingCount + 1, 5));
                    } else {
                      setImageStartOrder(1);
                    }
                    if (inputRef.current) {
                      try { inputRef.current.value = ''; } catch {}
                    }
                  }}
                  className="h-8 min-w-[180px] rounded-lg border border-edge-strong bg-surface-input px-2.5 text-[11px] text-heading outline-none focus:border-brand focus:ring-1 focus:ring-brand/35"
                >
                  <option value="">Selecione uma cor</option>
                  {productColorsForImages.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-label">
                  Arquivos de imagem
                  {selectedColorIdForImages ? (
                    <span className="ml-1 font-normal text-faint">
                      {maxNewFiles <= 0
                        ? '(limite atingido)'
                        : existingImagesForSelectedColor === 0
                          ? '(nenhuma cadastrada)'
                          : `(${existingImagesForSelectedColor} de 5)`}
                    </span>
                  ) : (
                    <span className="ml-1 font-normal text-faint">(até 5)</span>
                  )}
                </label>
                {maxNewFiles <= 0 && selectedColorIdForImages ? (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Esta cor já possui 5 imagens. Exclua alguma antes de enviar novas.
                  </p>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileChange}
                    ref={inputRef}
                    disabled={!selectedColorIdForImages}
                    className="text-[11px] text-body file:mr-2 file:rounded-md file:border-0 file:bg-surface-alt file:px-2.5 file:py-1.5 file:text-[11px] file:font-medium file:text-heading hover:file:bg-edge disabled:opacity-50"
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-label">
                  Ordem inicial
                </label>
                <div className="flex h-8 w-20 items-center rounded-lg border border-edge bg-surface-alt px-2.5 text-[11px] font-semibold text-heading">
                  {imageStartOrder}
                </div>
                <span className="text-[9px] text-faint">
                  {selectedColorIdForImages && existingImagesForSelectedColor > 0
                    ? `Será adicionada após as ${existingImagesForSelectedColor} existentes`
                    : 'Será a primeira imagem desta cor'}
                </span>
              </div>

              {imageFiles.length > 0 && (
                <button
                  type="button"
                  disabled={isUploadingImages}
                  onClick={handleConfirmAndUploadImages}
                  className="inline-flex h-8 items-center rounded-lg bg-brand px-3.5 text-[11px] font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploadingImages || isLoadingPresignedUrls ? 'Enviando...' : 'Confirmar envio'}
                </button>
              )}
            </div>

            {imagesError && (
              <div className="mt-3 rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger">
                {imagesError}
              </div>
            )}

            {imageFiles.length > 0 && presignedUrls.length === 0 && (
              <div className="mt-3">
                <p className="mb-2 text-[11px] font-medium text-label">
                  Arquivos selecionados ({imageFiles.length}):
                </p>
                <div className="flex flex-col gap-2">
                  {imageFiles.map((file, idx) => {
                    const isDragged = uploadDragFrom === idx;
                    const isDropTarget = uploadDragFrom !== null && uploadDragOver === idx && uploadDragFrom !== idx;
                    return (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      className={`flex cursor-grab items-center gap-3 rounded-lg border p-2 active:cursor-grabbing transition-all duration-150 ${isDragged ? 'opacity-30 scale-[0.97] border-edge' : 'border-edge-strong bg-surface'} ${isDropTarget ? 'ring-2 ring-brand bg-brand-soft' : ''}`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-semibold text-body">Ordem {imageStartOrder + idx}</div>
                      </div>
                      {imagePreviews[idx] && (
                        <img
                          src={imagePreviews[idx]}
                          alt={`Preview ${idx + 1}`}
                          className="h-16 w-16 rounded border border-edge-strong object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-[10px] font-medium text-body">
                          {file.name}
                        </div>
                        <div className="text-[10px] text-muted">
                          {(file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="inline-flex h-7 items-center rounded-lg border border-danger-edge bg-danger-soft px-2 text-[10px] font-medium text-danger hover:bg-danger-soft/80"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {presignedUrls.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-[11px] font-medium text-label">
                  Pronto para upload ({presignedUrls.length} arquivo(s)):
                </p>
                <div className="space-y-2">
                    {presignedUrls.map((item, idx) => {
                      const file = imageFiles[idx];
                      const preview = imagePreviews[idx] ?? null;
                      return (
                      <div
                        key={idx}
                        className="flex gap-3 rounded-lg border border-edge-strong bg-surface p-3"
                      >
                        {preview && (
                          <img
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            className="h-16 w-16 rounded border border-edge-strong object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="text-[11px] font-medium text-body">
                            {file?.name}
                          </div>
                          <div className="mt-1 text-[10px] text-muted">
                            {file && `${(file.size / 1024).toFixed(2)} KB`}
                          </div>
                          <div className="mt-1 truncate text-[10px] text-faint">
                            {item.imageKey}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {uploadedImageKeys.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-[11px] font-medium text-label">
                  Imagens confirmadas para esta cor:
                </p>
                <div className="flex flex-wrap gap-2">
                  {uploadedImageKeys.map((key) => (
                    <span
                      key={key}
                      className="truncate rounded-full border border-edge-strong bg-surface px-2.5 py-1 text-[10px] text-label"
                      title={key}
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Galeria de imagens do produto agrupadas por cor */}
            {!isLoadingProductImages && productImages.length > 0 && (
              <div className="mt-5 border-t border-edge pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                      Imagens cadastradas
                    </h3>
                    <p className="text-[10px] text-faint">
                      Arraste para reordenar ou selecione para excluir.
                    </p>
                  </div>
                  {selectedImageIds.size > 0 && (
                    <button
                      type="button"
                      disabled={isDeletingImages}
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center gap-1 rounded border border-danger-edge bg-danger-soft px-2.5 py-1 text-[10px] font-medium text-danger hover:bg-danger-soft/80 disabled:opacity-50"
                    >
                      {isDeletingImages
                        ? 'Excluindo...'
                        : `Excluir ${selectedImageIds.size} selecionada(s)`}
                    </button>
                  )}
                </div>

                {galleryReorderError && (
                  <div className="mb-3 rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger">
                    {galleryReorderError}
                  </div>
                )}

                {productImages.map((group) => {
                  const isDirty = galleryDirty.has(group.colorName);
                  const isSaving = gallerySaving === group.colorName;
                  const displayImages = getGalleryImages(group.colorName);
                  return (
                  <div key={group.colorName} className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                      <h4 className="flex items-center gap-1.5 text-[11px] font-medium text-label">
                        <span
                          className="inline-block h-3 w-3 rounded-full border border-edge-strong"
                          style={{ backgroundColor: group.hexCode }}
                        />
                        {group.colorName}
                      </h4>
                      {isDirty && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleGallerySaveReorder(group.colorName)}
                            className="inline-flex items-center rounded border border-brand/40 bg-brand/10 px-2 py-0.5 text-[9px] font-semibold text-brand hover:bg-brand/20 disabled:opacity-50"
                          >
                            {isSaving ? 'Salvando...' : 'Salvar ordem'}
                          </button>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleGalleryUndoReorder(group.colorName)}
                            className="inline-flex items-center rounded border border-edge-strong px-2 py-0.5 text-[9px] font-medium text-muted hover:text-heading disabled:opacity-50"
                          >
                            Desfazer
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {displayImages.map((img, idx) => {
                        const isDragged = galleryDragColor === group.colorName && galleryDragFrom === idx;
                        const isDropTarget = galleryDragColor === group.colorName && galleryDragFrom !== null && galleryDragOver === idx && galleryDragFrom !== idx;
                        return (
                        <div
                          key={img.id}
                          className={`relative cursor-grab active:cursor-grabbing transition-all duration-150 ${isDragged ? 'opacity-30 scale-95' : ''} ${isDropTarget ? 'ring-2 ring-brand rounded' : ''}`}
                          draggable
                          onDragStart={(e) => handleGalleryDragStart(e, group.colorName, idx)}
                          onDragOver={(e) => handleGalleryDragOver(e, group.colorName, idx)}
                          onDrop={handleGalleryDrop}
                          onDragEnd={handleGalleryDragEnd}
                        >
                          <input
                            type="checkbox"
                            checked={selectedImageIds.has(img.id)}
                            onChange={() => toggleImageSelection(img.id)}
                            className="absolute top-0.5 left-0.5 z-10 h-3.5 w-3.5 cursor-pointer accent-pink-500"
                          />
                          <span className="absolute -top-1.5 -right-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-surface-alt text-[8px] font-bold text-label ring-1 ring-edge-strong">
                            {idx + 1}
                          </span>
                          <img
                            src={img.url}
                            alt={`${group.colorName} #${idx + 1}`}
                            onClick={() => openLightbox(displayImages.map((i) => i.url), idx)}
                            className={`h-16 w-16 cursor-pointer rounded border object-cover transition hover:opacity-80 ${selectedImageIds.has(img.id) ? 'border-danger-action ring-1 ring-danger-action/50' : 'border-edge-strong'}`}
                          />
                        </div>
                        );
                      })}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {isLoadingProductImages && (
              <p className="mt-4 text-center text-[11px] text-muted">Carregando imagens...</p>
            )}
          </section>

          {/* Modal de confirmação de exclusão de imagens */}
          {showDeleteConfirm && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <div
                className="w-full max-w-sm rounded-xl border border-edge bg-surface p-5 text-xs shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="mb-3 text-sm font-semibold text-heading">
                  Confirmar exclusão de imagens
                </h3>
                <p className="mb-4 text-[11px] leading-relaxed text-label">
                  Você está prestes a excluir{' '}
                  <span className="font-semibold text-danger">
                    {selectedImageIds.size} imagem(ns)
                  </span>
                  . Essa ação afeta todos os SKUs que compartilham essas imagens.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-[11px] font-medium text-body hover:text-heading"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedImages}
                    className="inline-flex h-8 items-center rounded-lg border border-danger-edge bg-danger-action px-3 text-[11px] font-semibold text-white shadow hover:bg-danger-action/90"
                  >
                    Sim, excluir imagens
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEditProduct && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
              <div className="w-full max-w-lg rounded-2xl border border-edge bg-surface p-5 text-xs shadow-2xl shadow-black/70">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-heading">Editar produto</h2>
                  <button onClick={() => setShowEditProduct(false)} className="text-muted hover:text-heading text-lg leading-none">&times;</button>
                </div>

                {editProductError && (
                  <div className="mb-3 rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-xs text-danger">
                    {editProductError}
                  </div>
                )}

                <label className="mb-1 block text-[11px] font-medium text-muted">Nome</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="mb-3 w-full rounded-lg border border-edge-strong bg-surface-input px-3 py-2 text-xs text-heading outline-none focus:border-brand"
                />

                <label className="mb-1 block text-[11px] font-medium text-muted">Descrição</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="mb-3 w-full rounded-lg border border-edge-strong bg-surface-input px-3 py-2 text-xs text-heading outline-none focus:border-brand"
                />

                <label className="mb-1 block text-[11px] font-medium text-muted">Categoria</label>
                <select
                  value={editForm.categoryId}
                  onChange={(e) => setEditForm((f) => ({ ...f, categoryId: Number(e.target.value) }))}
                  className="mb-4 w-full rounded-lg border border-edge-strong bg-surface-input px-3 py-2 text-xs text-heading outline-none focus:border-brand"
                >
                  <option value={0} disabled>Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowEditProduct(false)}
                    className="rounded-lg border border-edge-strong bg-surface px-4 py-2 text-xs font-medium text-label transition hover:bg-surface-alt"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProduct}
                    disabled={isSavingProduct || !editForm.name.trim()}
                    className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover disabled:opacity-50"
                  >
                    {isSavingProduct ? 'Salvando…' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showCreateSku && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
              <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl border border-edge bg-surface p-5 text-xs shadow-2xl shadow-black/70">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-heading">
                      Adicionar SKUs ao produto
                    </h2>
                    <p className="text-[11px] text-muted">
                      Informe o código SKU, combine cores, tamanhos e informações de estoque/preço.
                    </p>
                    <p className="text-[10px] text-faint">
                      Dica de código SKU: use letras e números em maiúsculo separados por hífen, por exemplo{' '}
                      <span className="font-mono text-[10px] text-body">
                        CAMISETA-DRYFIT-AZUL-P
                      </span>
                      .
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseCreateSku}
                    className="inline-flex h-7 items-center rounded-lg border border-edge-strong bg-surface px-2 text-[11px] font-medium text-body hover:border-edge-strong hover:text-heading"
                  >
                    Fechar
                  </button>
                </div>

                <div className="overflow-auto rounded-xl border border-edge bg-surface">
                  <table className="min-w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-edge bg-surface-alt text-[10px] uppercase tracking-[0.16em] text-muted">
                        <th className="px-2 py-2 text-left font-semibold">
                          Cor
                        </th>
                        <th className="px-2 py-2 text-left font-semibold">
                          Tamanho
                        </th>
                        <th className="px-2 py-2 text-left font-semibold">
                          Largura (cm)
                        </th>
                        <th className="px-2 py-2 text-left font-semibold">
                          Altura (cm)
                        </th>
                        <th className="px-2 py-2 text-left font-semibold">
                          Comprimento (cm)
                        </th>
                        <th className="px-2 py-2 text-left font-semibold">
                          Peso (kg)
                        </th>
                        <th className="px-2 py-2 text-left font-semibold">
                          Estoque
                        </th>
                        <th className="px-2 py-2 text-left font-semibold">
                          Custo (R$)
                        </th>
                        <th className="px-2 py-2 text-left font-semibold">
                          Preço venda (R$)
                        </th>
                        <th className="px-2 py-2 text-left font-semibold">
                          Código SKU
                        </th>
                        <th className="px-2 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {skuRows.map((row, index) => (
                        <tr
                          key={index}
                          className="border-t border-edge hover:bg-surface-alt"
                        >
                          <td className="px-2 py-1.5 align-middle">
                            <select
                              value={row.colorId}
                              onChange={(e) =>
                                handleSkuRowChange(
                                  index,
                                  'colorId',
                                  e.target.value,
                                )
                              }
                              className="h-8 min-w-[120px] rounded-lg border border-edge-strong bg-surface-input px-2 text-[11px] text-heading outline-none focus:border-brand focus:ring-1 focus:ring-brand/35"
                            >
                              <option value="">Selecionar cor</option>
                              {colors.map((color) => (
                                <option key={color.id} value={color.id}>
                                  {color.nome}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-1.5 align-middle">
                            <select
                              value={row.sizeId}
                              onChange={(e) =>
                                handleSkuRowChange(
                                  index,
                                  'sizeId',
                                  e.target.value,
                                )
                              }
                              className="h-8 min-w-[90px] rounded-lg border border-edge-strong bg-surface-input px-2 text-[11px] text-heading outline-none focus:border-brand focus:ring-1 focus:ring-brand/35"
                            >
                              <option value="">Selecionar tam.</option>
                              {sizes.map((size) => (
                                <option key={size.id} value={size.id}>
                                  {size.etiqueta}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-1.5 align-middle">
                            <input
                              type="number"
                              step="0.01"
                              value={row.width}
                              onChange={(e) =>
                                handleSkuRowChange(
                                  index,
                                  'width',
                                  e.target.value,
                                )
                              }
                              className="h-8 w-20 rounded-lg border border-edge-strong bg-surface-input px-2 text-[11px] text-heading outline-none focus:border-brand focus:ring-1 focus:ring-brand/35"
                            />
                          </td>
                          <td className="px-2 py-1.5 align-middle">
                            <input
                              type="number"
                              step="0.01"
                              value={row.height}
                              onChange={(e) =>
                                handleSkuRowChange(
                                  index,
                                  'height',
                                  e.target.value,
                                )
                              }
                              className="h-8 w-20 rounded-lg border border-edge-strong bg-surface-input px-2 text-[11px] text-heading outline-none focus:border-brand focus:ring-1 focus:ring-brand/35"
                            />
                          </td>
                          <td className="px-2 py-1.5 align-middle">
                            <input
                              type="number"
                              step="0.01"
                              value={row.length}
                              onChange={(e) =>
                                handleSkuRowChange(
                                  index,
                                  'length',
                                  e.target.value,
                                )
                              }
                              className="h-8 w-24 rounded-lg border border-edge-strong bg-surface-input px-2 text-[11px] text-heading outline-none focus:border-brand focus:ring-1 focus:ring-brand/35"
                            />
                          </td>
                          <td className="px-2 py-1.5 align-middle">
                            <input
                              type="number"
                              step="0.01"
                              value={row.weight}
                              onChange={(e) =>
                                handleSkuRowChange(
                                  index,
                                  'weight',
                                  e.target.value,
                                )
                              }
                              className="h-8 w-20 rounded-lg border border-edge-strong bg-surface-input px-2 text-[11px] text-heading outline-none focus:border-brand focus:ring-1 focus:ring-brand/35"
                            />
                          </td>
                          <td className="px-2 py-1.5 align-middle">
                            <input
                              type="number"
                              value={row.stockQuantity}
                              onChange={(e) =>
                                handleSkuRowChange(
                                  index,
                                  'stockQuantity',
                                  e.target.value,
                                )
                              }
                              className="h-8 w-16 rounded-lg border border-edge-strong bg-surface-input px-2 text-[11px] text-heading outline-none focus:border-brand focus:ring-1 focus:ring-brand/35"
                            />
                          </td>
                          <td className="px-2 py-1.5 align-middle">
                            <input
                              type="number"
                              step="0.01"
                              value={row.costPrice}
                              onChange={(e) =>
                                handleSkuRowChange(
                                  index,
                                  'costPrice',
                                  e.target.value,
                                )
                              }
                              className="h-8 w-20 rounded-lg border border-edge-strong bg-surface-input px-2 text-[11px] text-heading outline-none focus:border-brand focus:ring-1 focus:ring-brand/35"
                            />
                          </td>
                          <td className="px-2 py-1.5 align-middle">
                            <input
                              type="number"
                              step="0.01"
                              value={row.sellingPrice}
                              onChange={(e) =>
                                handleSkuRowChange(
                                  index,
                                  'sellingPrice',
                                  e.target.value,
                                )
                              }
                              className="h-8 w-24 rounded-lg border border-edge-strong bg-surface-input px-2 text-[11px] text-heading outline-none focus:border-brand focus:ring-1 focus:ring-brand/35"
                            />
                          </td>
                          <td className="px-2 py-1.5 align-middle">
                            <div className="flex flex-col gap-1">
                              <input
                                type="text"
                                value={row.code}
                                onChange={(e) =>
                                  handleSkuRowChange(
                                    index,
                                    'code',
                                    e.target.value,
                                  )
                                }
                                placeholder={!row.colorId || !row.sizeId ? 'Aguardando cor e tamanho...' : 'SLUG-COR-TAM'}
                                disabled={!row.colorId || !row.sizeId}
                                className={`h-8 min-w-[190px] rounded-lg border bg-surface-input px-2 text-[11px] text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-1 focus:ring-brand/35 disabled:opacity-50 ${
                                  row.codeManuallyEdited
                                    ? 'border-amber-400 dark:border-amber-500/70'
                                    : 'border-edge-strong'
                                }`}
                              />
                              {/* Estado: Esperando */}
                              {(!row.colorId || !row.sizeId) && (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                                  <span className="text-[9px] text-muted">
                                    Preencha a cor e o tamanho para gerar o código
                                  </span>
                                </div>
                              )}
                              {/* Estado: Gerado */}
                              {row.colorId && row.sizeId && !row.codeManuallyEdited && row.code && (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400">
                                    Gerado a partir do produto, cor e tamanho
                                  </span>
                                </div>
                              )}
                              {/* Estado: Editado */}
                              {row.codeManuallyEdited && (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                                  <span className="text-[9px] text-amber-600 dark:text-amber-400">
                                    Editado manualmente
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRestoreSkuCode(index)}
                                    className="text-[9px] font-medium text-brand underline hover:text-brand-hover"
                                  >
                                    Usar código gerado
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-1.5 align-middle text-right">
                            {skuRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSkuRow(index)}
                                className="inline-flex h-7 items-center rounded-lg border border-danger-edge bg-danger-soft px-2 text-[10px] font-medium text-danger hover:bg-danger-soft/80"
                              >
                                Remover
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {skuFormError && (
                  <div className="mt-3 rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger">
                    {skuFormError}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleAddSkuRow}
                    className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-[11px] font-medium text-body hover:border-brand hover:text-brand"
                  >
                    + Adicionar linha
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCloseCreateSku}
                      className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-[11px] font-medium text-body hover:border-edge-strong hover:text-heading"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={isSavingSkus}
                      onClick={handleSaveSkus}
                      className="inline-flex h-8 items-center rounded-lg bg-brand px-3.5 text-[11px] font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingSkus ? 'Salvando...' : 'Salvar SKUs'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedSkuId !== null && (
            <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-edge bg-surface p-4 text-xs shadow-[0_0_40px_rgba(0,0,0,0.8)]">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-heading">
                    Detalhes do SKU
                  </h2>
                  <p className="text-[11px] text-muted">
                    ID #{selectedSkuId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseSkuDetails}
                  className="inline-flex h-7 items-center rounded-lg border border-edge-strong bg-surface px-2 text-[11px] font-medium text-body hover:border-edge-strong hover:text-heading"
                >
                  Fechar
                </button>
              </div>

              {isLoadingSkuDetails && (
                <div className="flex-1 rounded-lg border border-edge bg-surface p-3 text-label">
                  Carregando detalhes do SKU...
                </div>
              )}

              {!isLoadingSkuDetails && skuDetailsError && (
                <div className="flex-1 rounded-lg border border-danger-edge bg-danger-soft p-3 text-danger">
                  {skuDetailsError}
                </div>
              )}

              {!isLoadingSkuDetails && !skuDetailsError && selectedSku && (
                <div className="flex-1 space-y-3 overflow-auto rounded-lg border border-edge bg-surface p-3">
                  <div>
                    <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                      Identificação
                    </h3>
                    <p className="text-[11px] text-body">
                      Código:{' '}
                      <span className="font-mono text-[11px] text-heading">
                        {selectedSku.code}
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] text-body">
                      Cor:{' '}
                      <span className="font-medium">
                        {selectedSku.attributes.colorName}
                      </span>{' '}
                      • Tamanho:{' '}
                      <span className="font-medium">
                        {selectedSku.attributes.sizeName}
                      </span>
                    </p>
                    <p className="mt-2 text-[11px] text-label">
                      Status:{' '}
                      <span className="rounded-full border border-edge-strong bg-surface px-2.5 py-1 text-[11px] font-medium text-heading">
                        {selectedSkuStatusLabel}
                      </span>
                    </p>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        Dimensões
                      </h3>
                      {!isEditingDimensions && (
                        <button
                          type="button"
                          onClick={handleOpenEditDimensions}
                          className="text-[10px] font-medium text-brand hover:text-brand-hover"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                    {isEditingDimensions ? (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          <label className="block">
                            <span className="text-[10px] text-muted">Largura (cm)</span>
                            <input
                              type="number"
                              step="0.01"
                              value={dimensionsForm.width}
                              onChange={(e) => setDimensionsForm((f) => ({ ...f, width: e.target.value }))}
                              className="mt-0.5 block w-full rounded border border-edge-strong bg-surface-input px-2 py-1 text-[11px] text-heading focus:border-brand focus:outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] text-muted">Altura (cm)</span>
                            <input
                              type="number"
                              step="0.01"
                              value={dimensionsForm.height}
                              onChange={(e) => setDimensionsForm((f) => ({ ...f, height: e.target.value }))}
                              className="mt-0.5 block w-full rounded border border-edge-strong bg-surface-input px-2 py-1 text-[11px] text-heading focus:border-brand focus:outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] text-muted">Comprimento (cm)</span>
                            <input
                              type="number"
                              step="0.01"
                              value={dimensionsForm.length}
                              onChange={(e) => setDimensionsForm((f) => ({ ...f, length: e.target.value }))}
                              className="mt-0.5 block w-full rounded border border-edge-strong bg-surface-input px-2 py-1 text-[11px] text-heading focus:border-brand focus:outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] text-muted">Peso (kg)</span>
                            <input
                              type="number"
                              step="0.01"
                              value={dimensionsForm.weight}
                              onChange={(e) => setDimensionsForm((f) => ({ ...f, weight: e.target.value }))}
                              className="mt-0.5 block w-full rounded border border-edge-strong bg-surface-input px-2 py-1 text-[11px] text-heading focus:border-brand focus:outline-none"
                            />
                          </label>
                        </div>
                        {dimensionsError && (
                          <p className="text-[10px] text-danger">{dimensionsError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isSavingDimensions}
                            onClick={handleSaveDimensions}
                            className="rounded border border-brand bg-brand-soft px-2.5 py-0.5 text-[10px] font-medium text-brand hover:bg-brand-muted disabled:opacity-50"
                          >
                            {isSavingDimensions ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            type="button"
                            disabled={isSavingDimensions}
                            onClick={handleCancelEditDimensions}
                            className="rounded border border-edge-strong bg-surface-alt px-2.5 py-0.5 text-[10px] font-medium text-label hover:bg-surface-alt/80 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] text-body">
                          Largura: {selectedSku.dimensions.width} cm
                        </p>
                        <p className="text-[11px] text-body">
                          Altura: {selectedSku.dimensions.height} cm
                        </p>
                        <p className="text-[11px] text-body">
                          Comprimento: {selectedSku.dimensions.length} cm
                        </p>
                        <p className="text-[11px] text-body">
                          Peso: {selectedSku.dimensions.weight} kg
                        </p>
                      </>
                    )}
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        Estoque
                      </h3>
                      {!isEditingStock && (
                        <button
                          type="button"
                          onClick={handleOpenEditStock}
                          className="text-[10px] font-medium text-brand hover:text-brand-hover"
                        >
                          Ajustar
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-body">
                      Total: {selectedSku.stock.total}
                    </p>
                    <p className="text-[11px] text-body">
                      Reservado: {selectedSku.stock.reserved}
                    </p>
                    <p className="text-[11px] text-body">
                      Disponível: {selectedSku.stock.available}
                    </p>
                    {isEditingStock && (
                      <div className="mt-2 space-y-1.5 rounded border border-edge bg-surface-alt p-2">
                        <label className="block">
                          <span className="text-[10px] text-muted">Nova quantidade total</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={stockForm.quantity}
                            onChange={(e) => setStockForm((f) => ({ ...f, quantity: e.target.value }))}
                            className="mt-0.5 block w-full rounded border border-edge-strong bg-surface-input px-2 py-1 text-[11px] text-heading focus:border-brand focus:outline-none"
                            placeholder="Ex: 45"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] text-muted">Motivo do ajuste</span>
                          <input
                            type="text"
                            value={stockForm.reason}
                            onChange={(e) => setStockForm((f) => ({ ...f, reason: e.target.value }))}
                            className="mt-0.5 block w-full rounded border border-edge-strong bg-surface-input px-2 py-1 text-[11px] text-heading focus:border-brand focus:outline-none"
                            placeholder="Ex: Correção de cadastro"
                          />
                        </label>
                        {stockError && (
                          <p className="text-[10px] text-danger">{stockError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isSavingStock}
                            onClick={handleSaveStock}
                            className="rounded border border-brand bg-brand-soft px-2.5 py-0.5 text-[10px] font-medium text-brand hover:bg-brand-muted disabled:opacity-50"
                          >
                            {isSavingStock ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            type="button"
                            disabled={isSavingStock}
                            onClick={handleCancelEditStock}
                            className="rounded border border-edge-strong bg-surface-alt px-2.5 py-0.5 text-[10px] font-medium text-label hover:bg-surface-alt/80 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        Preços
                      </h3>
                      {!isEditingPrice && (
                        <button
                          type="button"
                          onClick={handleOpenEditPrice}
                          className="text-[10px] font-medium text-brand hover:text-brand-hover"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                    {isEditingPrice ? (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          <label className="block">
                            <span className="text-[10px] text-muted">Custo (R$)</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={priceForm.costPrice}
                              onChange={(e) => setPriceForm((f) => ({ ...f, costPrice: e.target.value }))}
                              className="mt-0.5 block w-full rounded border border-edge-strong bg-surface-input px-2 py-1 text-[11px] text-heading focus:border-brand focus:outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] text-muted">Venda (R$)</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={priceForm.sellingPrice}
                              onChange={(e) => setPriceForm((f) => ({ ...f, sellingPrice: e.target.value }))}
                              className="mt-0.5 block w-full rounded border border-edge-strong bg-surface-input px-2 py-1 text-[11px] text-heading focus:border-brand focus:outline-none"
                            />
                          </label>
                        </div>
                        {priceError && (
                          <p className="text-[10px] text-danger">{priceError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isSavingPrice}
                            onClick={handleSavePrice}
                            className="rounded border border-brand bg-brand-soft px-2.5 py-0.5 text-[10px] font-medium text-brand hover:bg-brand-muted disabled:opacity-50"
                          >
                            {isSavingPrice ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            type="button"
                            disabled={isSavingPrice}
                            onClick={handleCancelEditPrice}
                            className="rounded border border-edge-strong bg-surface-alt px-2.5 py-0.5 text-[10px] font-medium text-label hover:bg-surface-alt/80 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] text-body">
                          Custo:{' '}
                          <span className="font-medium">
                            R$ {selectedSku.price.costPrice.toFixed(2)}
                          </span>
                        </p>
                        <p className="text-[11px] text-body">
                          Venda:{' '}
                          <span className="font-medium text-brand">
                            R$ {selectedSku.price.sellingPrice.toFixed(2)}
                          </span>
                        </p>
                      </>
                    )}
                  </div>
                  {selectedSku.images && selectedSku.images.length > 0 && (
                    <div>
                      <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        Imagens
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSku.images.map((img, i) => (
                          <div key={img.id} className="relative">
                            <span className="absolute -top-1.5 -right-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-surface-alt text-[8px] font-bold text-label ring-1 ring-edge-strong">
                              {i + 1}
                            </span>
                            <img
                              src={img.url}
                              alt={`Imagem ${img.id}`}
                              onClick={() => openLightbox(selectedSku!.images.map((im) => im.url), i)}
                              className="h-16 w-16 cursor-pointer rounded border border-edge-strong object-cover transition hover:opacity-80"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6"
          onClick={closeLightbox}
        >
          <div className="relative flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            {/* Close button — top-right of image */}
            <button
              onClick={closeLightbox}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-base text-white backdrop-blur transition hover:bg-white/20"
            >
              ✕
            </button>

            <img
              src={lightbox.urls[lightbox.index]}
              alt="Visualização ampliada"
              className="max-h-[75vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />

            {/* Navigation below image */}
            {lightbox.urls.length > 1 && (
              <div className="flex items-center gap-3">
                <button
                  disabled={lightbox.index === 0}
                  onClick={() => setLightbox({ ...lightbox, index: lightbox.index - 1 })}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10"
                >
                  ‹
                </button>

                <div className="flex gap-1.5">
                  {lightbox.urls.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLightbox({ ...lightbox, index: idx })}
                      className={`h-2 w-2 rounded-full transition ${idx === lightbox.index ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`}
                    />
                  ))}
                </div>

                <button
                  disabled={lightbox.index === lightbox.urls.length - 1}
                  onClick={() => setLightbox({ ...lightbox, index: lightbox.index + 1 })}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

