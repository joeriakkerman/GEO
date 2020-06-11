<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RouteController extends Controller
{

    public function __invoke(Request $request)
    {
        try{
            $xml_string = $request->route->get();
            $xml = simplexml_load_string($xml_string);
            $points = [];

            foreach($xml->wpt as $wpt){
                $points[] = [(double)$wpt->attributes()['lat'], (double)$wpt->attributes()['lon'], (string)$wpt->children()->time];
            }

            return JsonResponse::create(json_encode($points));
        }catch(\Exception $e){
            return JsonResponse::create(['error' => "Something went wrong"], JsonResponse::HTTP_CONFLICT);
        } catch (FileNotFoundException $e) {
            return JsonResponse::create(['error' => "Something went wrong while trying to parse file"], JsonResponse::HTTP_CONFLICT);
        }
    }
}
