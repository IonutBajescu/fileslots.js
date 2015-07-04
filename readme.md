# FileSlotsJS 


### Example of backend handling of the files
    <?php namespace App\Http\Controllers;
    
    use App\Models\File;
    use Illuminate\Http\Response;
    use Illuminate\Support\Facades\Input;
    use Symfony\Component\HttpFoundation\BinaryFileResponse;
    use Symfony\Component\HttpFoundation\ResponseHeaderBag;
    use Symfony\Component\HttpFoundation\StreamedResponse;
    
    /**
     * @Controller(prefix="files")
     */
    class FilesController extends Controller
    {
    
        /**
         * @Post("upload", as="files.upload")
         * @Middleware("admin")
         */
        public function upload()
        {
            $response = ['files' => []];
            $files = Input::file();
            foreach ($files['files'] as $file) {
                $response['files'][] = File::createFromUploaded($file);
            }
    
            return $response;
        }
    
        /**
         * @Get("view/{file}", as="files.view")
         */
        public function view(File $file)
        {
            $response = new BinaryFileResponse($file->getAbsolutePath());
            $response->headers->set('Content-Disposition', 'inline; filename="' . $file->real_filename . '"');
    
            return $response;
        }
    
        /**
         * @Get("download/{file}", as="files.download")
         */
        public function download(File $file)
        {
            $response = $this->view($file);
            $response->headers->set('Content-Disposition', 'attachment; filename="' . $file->real_filename . '"');
    
            return $response;
        }
    }
