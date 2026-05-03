import {useToast} from './ToastContext';

export function ToastDemo() {
  const toast = useToast();

  return (
    <div className="flex flex-wrap gap-4 p-4">
      <button
        onClick={() => toast.success('تم الحفظ بنجاح', 'تم حفظ البيانات بنجاح')}
        className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        Success Toast
      </button>
      <button
        onClick={() => toast.error('خطأ في الحفظ', 'حدث خطأ أثناء حفظ البيانات')}
        className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Error Toast
      </button>
      <button
        onClick={() => toast.warning('تحذير', 'يرجى مراجعة البيانات')}
        className="rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
      >
        Warning Toast
      </button>
      <button
        onClick={() => toast.info('معلومة', 'جاري تحديث البيانات...')}
        className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Info Toast
      </button>
    </div>
  );
}
