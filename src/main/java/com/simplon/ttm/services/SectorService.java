package com.simplon.ttm.services;

import java.util.Optional;

import com.simplon.ttm.dto.SectorDto;
import com.simplon.ttm.models.Sector;

public interface SectorService {

    void saveSector(SectorDto sectorDto);

    Optional<Sector> getById(Long id);
}
