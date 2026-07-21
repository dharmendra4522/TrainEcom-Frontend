import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { BrandService } from "../../services/brand.service";
import { Store } from "@ngrx/store";
import * as BrandActions from "./brand.action";
import { selectAllBrands } from "./brand.selectors";
import { withLatestFrom, filter, exhaustMap, map, catchError, of } from "rxjs";

@Injectable()
export class BrandEffects {
    private actions$ = inject(Actions);
    private brandService = inject(BrandService);
    private store = inject(Store);

    loadBrands$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandActions.loadBrands),
            withLatestFrom(this.store.select(selectAllBrands)),
            filter(([_, brands]) => !brands || brands.length === 0),
            exhaustMap(() =>
                this.brandService.getAllBrands().pipe(
                    map((brands) => BrandActions.loadBrandsSuccess({ brands: brands || [] })),
                    catchError((error) =>
                        of(BrandActions.loadBrandsFailure({ error: error?.message || 'Failed to load brands' }))
                    )
                )
            )
        )
    );
}
